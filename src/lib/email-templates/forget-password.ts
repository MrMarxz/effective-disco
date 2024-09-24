export const ForgetPasswordTemplate = (name: string, link: string) => `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your JaKaMa Password</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 5px;
                padding: 20px;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Reset Your JaKaMa Password</h1>
            <p>Hello, ${name}</p>
            <p>We received a request to reset your password for your JaKaMa account. If you didn't make this request, please ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <a href="${link}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste the following link into your browser:</p>
            <p>${link}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
            <p>Best regards,<br>The JaKaMa Team</p>
        </div>
    </body>
</html>`