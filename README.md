# செய்தி360 (Seithi360) 💬

Seithi360 is a comprehensive news aggregator application designed to enhance community awareness by curating and sharing news from verified local sources. The platform delivers personalized news feeds based on user preferences and provides email updates with articles tailored to their interests.

---

## Features 📊

- **Aggregate News**: News is sourced from verified APIs and through our custom web scraping technology.
- **Content Categorization**: Articles are categorized to enhance discoverability.
- **Personalized Feeds**: Users receive tailored news articles based on their preferences, district, and location.
- **Email Updates**: Automatic email notifications with articles matching user interests.
- **Multi-language Support**: News articles are delivered in the user’s preferred language.
- **Accurate and Relevant**: Ensures information accuracy by sourcing from trusted sources and implementing content filtering.

---

## Prerequisites 🛠️

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- MySQL Database
- A modern web browser

---

## Installation and Setup 🚀

### Backend 🔧

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Update the MySQL server password in the configuration file (e.g., `config.js` or `.env`):
   ```plaintext
   DB_PASSWORD=<your_mysql_server_password>
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend 🌐

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm start
   ```

---

## User Registration and Personalization 👤

Users register by providing the following details:

- Name
- Email
- District
- Preferences (e.g., topics of interest)
- Location
- Language

This information is used to deliver personalized news articles and email updates.

---

## Automatic Web Scraping 🔄

Seithi360 includes an automated web scraping engine that:

- Scrapes data from local news websites.
- Processes and passes the data to our API.
- Ensures relevance and categorization for user feeds.

---

## API Integration 🔐

Seithi360 integrates with several verified news APIs to supplement scraped content and ensure news authenticity.

---

## Folder Structure 🌟

```
seithi360/
├── backend/        # Backend API server and database configuration
├── frontend/       # Frontend application (React-based)
├── README.md       # Project documentation
```

---

## Add Webpage Image 🖼

To showcase the webpage design of Seithi360, you can add an image here:

![Seithi360 Webpage](path/to/your/image.png)

> Replace `path/to/your/image.png` with the relative path to your image file.

---

## Contributing 🌈

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature-name"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License 🔒

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Contact 📧

For support or inquiries, please contact:

- **Email**: like22050.it@rmkec.ac.in rith22080.it@rmkec.ac.in broh22012.it@rmkec.ac.in
- **Website**: [Seithi360](https://seithi360.com) (waiting for hosting)

---

Enjoy staying informed with Seithi360! 🌐
