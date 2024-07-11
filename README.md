
# Personal Shopping Assistant

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [Configuration](#configuration)
7. [Docker Deployment](#docker-deployment)
8. [Contributing](#contributing)
9. [License](#license)
10. [Contact](#contact)

## Project Overview

The **Personal Shopping Assistant** is a Flask-based web application designed to help users with their shopping needs. Utilizing OpenAI's language model, the assistant can provide detailed product information and personalized recommendations. The project also supports deployment via Docker for ease of setup and scalability.

## Features

- Personalized product recommendations
- Detailed product information
- Easy-to-use web interface
- Multi-language support (English and Arabic)
- Dockerized deployment for easy setup

## Installation

### Prerequisites

- Python 3.8 or higher
- Docker (optional, for containerized deployment)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Ghada1911/personal-shopping-assistant.git
   cd personal-shopping-assistant
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   flask run
   ```

## Usage

Once the application is running, open your web browser and navigate to `http://127.0.0.1:5000`. You will be greeted with the main interface of the Personal Shopping Assistant. From here, you can start interacting with the assistant to get product recommendations and information.

## API Endpoints

Here is a list of available API endpoints:

- `GET /`: Home page
- `GET /products`: Get a list of all products
- `GET /products/<id>`: Get details of a specific product
- `POST /recommendations`: Get personalized product recommendations

## Configuration

The application can be configured through environment variables. The following variables are used:

- `FLASK_APP`: The entry point of the application (default: `app.py`)
- `FLASK_ENV`: The environment in which the app is running (default: `development`)
- `OPENAI_API_KEY`: Your OpenAI API key

## Docker Deployment

To deploy the application using Docker, follow these steps:

1. Build the Docker image:
   ```bash
   docker build -t personal-shopping-assistant .
   ```

2. Run the Docker container:
   ```bash
   docker run -d -p 5000:5000 personal-shopping-assistant
   ```

The application should now be running at `http://127.0.0.1:5000`.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or suggestions, feel free to open an issue or contact me at your-email@example.com.
