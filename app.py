from flask import Flask, request, jsonify, render_template, session
import openai
import os
from werkzeug.utils import secure_filename
import json
from PIL import Image
import pytesseract
import markdown
from flask_session import Session


app = Flask(__name__)

# Configure session to use filesystem (can use other types like Redis, Memcached, etc.)
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'supersecretkey'

# Added these two lines to configure the session cookie
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Change 'None' to 'Lax' or 'Strict' as per your needs
app.config['SESSION_COOKIE_SECURE'] = True  # Ensures the cookie is only sent over HTTPS

Session(app)

# Retrieve API key from environment variable
api_key = os.environ.get("OPENAI_API_KEY")

# Initialize OpenAI API client
openai.api_key = api_key

# Define the directory where uploaded files will be stored
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the UPLOAD_FOLDER exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load product catalog from JSON file
with open('product_catalog.json', 'r') as f:
    product_catalog = json.load(f)

@app.route('/')
def home():
    return render_template('index.html')

# Route to add a product to the cart
@app.route('/add_to_cart/<product_id>')
def add_to_cart(product_id):
    # Find the product by its ID extracted from the cart_url
    product = next((p for p in product_catalog if p["cart_url"].endswith(product_id)), None)
    
    if product:
        # Render the template with product details
        return render_template('add_to_cart.html', product=product)
    else:
        return render_template('error.html', message="Product not found"), 404


@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html', products=product_catalog)

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')

    if not user_message:
        return jsonify({'response': 'Invalid input'}), 400

    # Initialize session chat history if not present
    if 'chat_history' not in session:
        session['chat_history'] = []

    try:
        # Check if the user mentioned a specific product
        found_product = None
        for product in product_catalog:
            if product['name'].lower() in user_message.lower():
                found_product = product
                break
        
        if found_product:
            # Prepare response with product details and image link
            response_text = f"<div style='display: flex; align-items: center;'>"
            response_text += f"<img src='/static/images/{found_product['image']}' alt='Product Image' style='max-width: 150px;'>\n"
            
            response_text += f"<div style='margin-left: 10px;'>"  # Adjust margin as needed
            response_text += f"<b>{found_product['name']}</b>: {found_product['description']}<br>"
            response_text += f"<b>Price:</b> ${found_product['price']}<br>"
            response_text += f"<b>Add to Cart:</b> <a href='{found_product['cart_url']}'>Click Here</a>"
            response_text += f"</div>"
            
            response_text += f"</div>"

            # Append user and assistant messages to chat history
            session['chat_history'].append({"role": "user", "content": user_message})
            session['chat_history'].append({"role": "assistant", "content": response_text})
            session.modified = True
            
            return jsonify({'response': response_text})

        # Add user message to chat history
        session['chat_history'].append({"role": "user", "content": user_message})

        # Use GPT-4o to generate a response with chat history
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=session['chat_history'],
            max_tokens=150
        )

        response_text = response['choices'][0]['message']['content'].strip()
        # Convert markdown to HTML
        response_text = markdown.markdown(response_text)

        # Add assistant message to chat history
        session['chat_history'].append({"role": "assistant", "content": response_text})
        session.modified = True

        return jsonify({'response': response_text})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'response': 'Internal Server Error'}), 500

@app.route('/upload/', methods=['POST'])
def upload_file():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({'response': 'No file part'}), 400

        file = request.files['file']

        # If user does not select file, browser also submit an empty part without filename
        if file.filename == '':
            return jsonify({'response': 'No selected file'}), 400

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            # Open and process the image using Pillow
            try:
                image = Image.open(file_path)
                width, height = image.size

                # Perform OCR to extract text
                ocr_text = pytesseract.image_to_string(image)

                response = {
                    
                    'filename': filename,
                    'width': width,
                    'height': height,
                    'ocr_text': ocr_text,
                }

                return jsonify(response)
            except Exception as e:
                return jsonify({'response': f'Error processing image: {e}'}), 500

    except Exception as e:
        print(f"Error uploading file: {e}")
        return jsonify({'response': 'Error uploading file'}), 500


with open('product_catalog.json', 'r') as f:
    product_catalog = json.load(f)

@app.route('/search', methods=['GET'])
def search_products():
    query = request.args.get('query', '')
    results = [product for product in product_catalog if query.lower() in product['name'].lower()]
    return jsonify(results)

@app.route('/products', methods=['GET'])
def get_products():
    return jsonify(product_catalog)

@app.route('/product/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in product_catalog if p['id'] == product_id), None)
    return jsonify(product) if product else ('', 404)

@app.route('/product/<int:product_id>/details', methods=['GET'])
def product_details_page(product_id):
    return render_template('product_details.html')

@app.route('/all-products', methods=['GET'])
def all_products_page():
    return render_template('all_products.html')

@app.route('/product/details')
def product_details():
    return render_template('product_details.html')


@app.route('/api/product/<product_name>')
def api_product_details(product_name):
    product = next((item for item in product_catalog if item["name"] == product_name), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
