# Serial Mail Mailer

The Serial Mail Mailer is a lightweight and efficient email sending application designed
to simplify the process of sending mass emails. 
It focuses on the core task of sending emails to a large number of recipients
while maintaining a streamlined and user-friendly interface.

Built with Electron, React, Ant Design, CKEditor 5, and nodemailer.

## Features

- **Simple Streamlined Interface**: The Serial Mail Mailer offers an intuitive and straightforward user interface, making it easy for users to quickly send mass emails without unnecessary complexity.

- **Efficient Feature Set**: The app focuses on the essential task of sending mass emails, avoiding unnecessary bells and whistles. This ensures that you can get your email campaigns up and running in no time.

- **SMTP and Gmail Support**: Connect directly to your SMTP server or use Gmail with an app-specific password. The app handles both transport methods seamlessly.

- **CSV Recipient Import**: Importing recipients is made easy with support for CSV (Comma-Separated Values) files. Simply paste your CSV data or upload a CSV file. The CSV should be comma-separated and have at least `firstname`, `lastname`, and `email` fields.

- **Template Variables**: Use any CSV column as a template variable in subject or body. Variables are wrapped in `##fieldname##` (e.g. `##firstname##`) and are replaced per recipient automatically.

- **Rich Text Editor**: Compose your email with a full-featured WYSIWYG editor (CKEditor 5). A plain-text fallback is generated automatically.

- **Attachment Support**: 
  - **Shared attachments**: Include the same file(s) in every email.
  - **Individual attachments**: Specify a CSV column containing per-recipient file paths (comma-separated for multiple files).

- **Preview**: See a rendered HTML preview of your email with template variables replaced for the first recipient before sending.

- **Progress Tracking**: Real-time progress bar during sending, with error reporting for any failed deliveries.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Development

```bash
npm install
npm start
```

### Build

```bash
npm run make
```

This will create platform-specific installers in the `out/` directory.

## Usage

1. **Recipients**: Upload a CSV file or paste CSV data. Required fields: `firstname`, `lastname`, `email`. Any additional fields become available as template variables.

2. **Content**: Enter a subject and compose your email body using the rich text editor. Use `##fieldname##` syntax for template variables (e.g. `Hello ##firstname##`).

3. **Attachments** (optional): Choose between shared attachments (same files for everyone) or individual attachments (file paths specified per recipient in a CSV column).

4. **Settings**: Configure your transport:
   - **SMTP**: Enter server, port, credentials, and sender info.
   - **Gmail**: Enter your Gmail address and an [app-specific password](https://myaccount.google.com/apppasswords).

5. **Confirmation & Send**: Review the overview, preview the example mail, and hit Send. A progress bar tracks each mail. Failed deliveries are listed with error details.

## Requirements

- An active SMTP server connection or a Gmail account with app-specific password.
- CSV file format for importing recipients.

## Development Commands

| Command | Description |
|---|---|
| `npm start` | Start the app in development mode |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run package` | Package the app (no installer) |
| `npm run make` | Create platform installers |

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and known issues.

## License

This project is licensed under the [MIT License](LICENSE.md).

## Feedback and Contributions

We welcome your feedback and contributions to improve the Serial Mail Mailer. If you encounter issues or have suggestions, please open an issue or submit a pull request on our [GitHub repository](https://github.com/your-username/serial-mail-mailer).

## Support

For support or inquiries, please open an issue here in the GitHub repository.

## Credits

The Serial Mail Mailer was created and is maintained by [Michael Rotmanov](https://www.rotmanov.de).
