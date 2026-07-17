import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import AppLayout from "../components/layout/AppLayout.jsx";

import DashboardPage from "../pages/DashboardPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx";

import LoginPage from "../pages/auth/LoginPage.jsx";
import RegisterPage from "../pages/auth/RegisterPage.jsx";

import ArticleDetailsPage from "../pages/articles/ArticleDetailsPage.jsx";
import ArticlesPage from "../pages/articles/ArticlesPage.jsx";
import CreateArticlePage from "../pages/articles/CreateArticlePage.jsx";
import MyArticlesPage from "../pages/articles/MyArticlesPage.jsx";

import ArticleContributionsPage from "../pages/contributions/ArticleContributionsPage.jsx";
import ContributionReviewPage from "../pages/contributions/ContributionReviewPage.jsx";
import CreateContributionPage from "../pages/contributions/CreateContributionPage.jsx";
import MyContributionsPage from "../pages/contributions/MyContributionsPage.jsx";

import VersionHistoryPage from "../pages/versions/VersionHistoryPage.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicOnlyRoute from "./PublicOnlyRoute.jsx";
import EditArticlePage from "../pages/articles/EditArticlePage.jsx";
import VersionDetailsPage from "../pages/versions/VersionDetailsPage.jsx";

const router = createBrowserRouter([
  {
    element: <AppLayout />,

    children: [
      {
        path: "/",
        element: <HomePage />,
      },

      {
        path: "/articles",
        element: <ArticlesPage />,
      },

      {
        path: "/articles/:slug",
        element: <ArticleDetailsPage />,
      },

      {
        path: "/articles/:articleId/versions",
        element: <VersionHistoryPage />,
      },

      {
        path: "/articles/:articleId/versions/:versionNumber",
        element: <VersionDetailsPage />,
      },
      
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },

      {
        element: <PublicOnlyRoute />,

        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },

          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },

      {
        element: <ProtectedRoute />,

        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },

          {
            path: "/articles/new",
            element: <CreateArticlePage />,
          },


          {
            path: "/articles/:articleId/contribute",
            element: <CreateContributionPage />,
          },

          {
            path: "/articles/:articleId/contributions",
            element: <ArticleContributionsPage />,
          },

          {
            path: "/my-articles",
            element: <MyArticlesPage />,
          },

          {
            path: "/my-contributions",
            element: <MyContributionsPage />,
          },

          {
            path: "/contributions/:contributionId",
            element: <ContributionReviewPage />,
          },

          {
            path: "/articles/:articleId/edit",
            element: <EditArticlePage />,
          },
        ],
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}