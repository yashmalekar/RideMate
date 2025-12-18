# RideMate

RideMate is a comprehensive ride tracking application designed for motorcyclists. It allows users to log their rides, track expenses, view statistics, connect with other riders through a social feed, and access emergency features like SOS alerts.

## Features

- **Ride Tracking**: Log and manage your motorcycle rides with details like start/destination locations, distance, duration, and notes.
- **Expense Management**: Track various expenses including fuel, food, maintenance, upgrades, and more.
- **Dashboard**: View your riding statistics, recent rides, and achievements.
- **Social Feed**: Connect with other riders and share your experiences.
- **User Profiles**: Customize your profile with avatar, bio, and personal information.
- **Statistics**: Visualize your riding data with charts and graphs.
- **Emergency SOS**: Send instant alerts to emergency contacts.
- **Settings**: Customize accent colors and choose between metric or imperial units.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Dark Mode**: Toggle between light and dark themes.

## Technology Stack

### Frontend
- **React 18** - Modern JavaScript library for building user interfaces
- **TypeScript** - Typed superset of JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **ShadCN UI** - Modern UI components built on Radix UI and Tailwind CSS
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Declarative routing for React
- **React Query** - Powerful data synchronization for React
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Beautiful & consistent icon toolkit
- **Recharts** - Composable charting library built on React components

### Backend & Infrastructure
- **AWS Amplify** - Complete solution for building cloud-powered mobile and web apps
- **AWS Cognito** - User authentication and authorization
- **AWS S3** - Object storage for media files
- **AWS Lambda** - Serverless compute service for API endpoints
- **AWS API Gateway** - Create, publish, maintain, monitor, and secure APIs

### Development Tools
- **ESLint** - Tool for identifying and reporting on patterns in ECMAScript/JavaScript code
- **TypeScript ESLint** - ESLint rules for TypeScript
- **PostCSS** - Tool for transforming CSS with JavaScript
- **Autoprefixer** - PostCSS plugin to parse CSS and add vendor prefixes

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **bun** package manager
- **Git** for version control

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ridemate.git
   cd ridemate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Environment Setup:**

   Create a `.env` file in the root directory and add the following environment variables:

   ```env
   VITE_RIDE_API=your_ride_api_endpoint
   VITE_EXPENSE_API=your_expense_api_endpoint
   VITE_SETTINGS_API=your_settings_api_endpoint
   ```

   Replace the placeholder values with your actual AWS Lambda API Gateway endpoints.

4. **AWS Configuration:**

   Update `src/awsConfig.ts` with your AWS Amplify configuration:

   ```typescript
   import { Amplify } from "aws-amplify";

   Amplify.configure({
     Auth: {
       Cognito:{
         userPoolId: "your_user_pool_id",
         userPoolClientId: "your_user_pool_client_id",
         identityPoolId: "your_identity_pool_id",
         loginWith:{email:true}
       }
     },
     Storage: {
       S3:{
         bucket: "your_s3_bucket_name",
         region: "your_aws_region"
       }
     }
   });
   ```

## Running the Application

1. **Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

   The application will be available at `http://localhost:8080`.

2. **Build for Production:**
   ```bash
   npm run build
   # or
   yarn build
   # or
   bun build
   ```

3. **Preview Production Build:**
   ```bash
   npm run preview
   # or
   yarn preview
   # or
   bun preview
   ```

## Usage

1. **Sign Up/Login:** Create an account or log in with your existing credentials.
2. **Dashboard:** View your riding statistics and recent activities.
3. **Create Ride:** Log a new motorcycle ride with all relevant details.
4. **Manage Expenses:** Track and categorize your riding expenses.
5. **Social Feed:** Connect with other riders and share experiences.
6. **Profile:** Update your personal information and preferences.
7. **Settings:** Customize your app experience (theme, units, accent color).
8. **Statistics:** Analyze your riding patterns with detailed charts.

## Project Structure

```
ridemate/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images and media files
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # ShadCN UI components
│   │   └── Layout.tsx    # Main layout component
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── RideContext.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   ├── pages/            # Page components
│   └── awsConfig.ts      # AWS Amplify configuration
├── lambdaCode/           # AWS Lambda function code
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── README.md             # Project documentation
```

## Contributing

We welcome contributions to RideMate! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting a PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact the maintainers
- Check the documentation for common solutions

## Acknowledgments

- Icons provided by [Lucide React](https://lucide.dev/)
- UI components built with [ShadCN UI](https://ui.shadcn.com/)
- Authentication powered by [AWS Amplify](https://aws.amazon.com/amplify/)
- Charts created with [Recharts](https://recharts.org/)

---

Happy riding! 🏍️
