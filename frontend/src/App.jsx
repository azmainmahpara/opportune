import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminCourses from './components/admin/AdminCourses'
import AdminJobs from "./components/admin/AdminJobs"
import Applicants from './components/admin/Applicants'
import Companies from './components/admin/Companies'
import CompanyCreate from './components/admin/CompanyCreate'
import CompanySetup from './components/admin/CompanySetup'
import CourseStudents from './components/admin/CourseStudents'
import CreateCourse from './components/admin/CreateCourse'
import EditCourse from './components/admin/EditCourse'
import EditJob from './components/admin/EditJob'
import PostJob from './components/admin/PostJob'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AuthRoute from './components/auth/AuthRoute'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Browse from './components/Browse'
import CourseDescription from './components/CourseDescription'
import Courses from './components/Courses'
import Home from './components/Home'
import JobDescription from './components/JobDescription'
import Jobs from './components/Jobs'
import Profile from './components/Profile'
import RecruiterProfile from './components/RecruiterProfile'
import ErrorBoundary from './components/shared/ErrorBoundary'
import Layout from './components/shared/Layout'
import Chat from './pages/Chat'


const appRouter = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: (
          <>
            <Home />
          </>
        )
      },
      {
        path: '/login',
        element: (
          <>
            <Login />
          </>
        )
      },
      {
        path: '/signup',
        element: (
          <>
            <Signup />
          </>
        )
      },
      {
        path: "/jobs",
        element: (
          <>
            <Jobs />
          </>
        )
      },
      {
        path: "/description/:id",
        element: (
          <>
            <JobDescription />
          </>
        )
      },
      {
        path: "/browse",
        element: (
          <>
            <Browse />
          </>
        )
      },
      {
        path: "/profile",
        element: (
          <AuthRoute>
            <Profile />
          </AuthRoute>
        )
      },
      // admin ke liye yha se start hoga
      {
        path:"/admin/companies",
        element: (
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/companies/create",
        element: (
          <ProtectedRoute>
            <CompanyCreate />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/companies/:id",
        element: (
          <ProtectedRoute>
            <CompanySetup />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/jobs",
        element: (
          <ProtectedRoute>
            <AdminJobs />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/jobs/create",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/jobs/:id/applicants",
        element: (
          <ProtectedRoute>
            <Applicants />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/courses",
        element: (
          <ProtectedRoute>
            <AdminCourses />
          </ProtectedRoute>
        )
      },
      {
        path:"/admin/courses/create",
        element: (
          <ProtectedRoute>
            <CreateCourse />
          </ProtectedRoute>
        )
      },
      {
        path: "/courses",
        element: (
          <>
            <Courses />
          </>
        )
      },
      {
        path: "/course/:id",
        element: (
          <>
            <CourseDescription />
          </>
        ),
        errorElement: <ErrorBoundary />
      },
      {
        path: "/chat/:userId",
        element: (
          <AuthRoute>
            <Chat />
          </AuthRoute>
        )
      },
      {
        path: "/admin/courses/:id",
        element: (
          <ProtectedRoute>
            <EditCourse />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />
      },
      {
        path: "/admin/courses/:id/students",
        element: (
          <ProtectedRoute>
            <CourseStudents />
          </ProtectedRoute>
        ),
        errorElement: <ErrorBoundary />
      },
      {
        path: "/admin/jobs/edit/:id",
        element: (
          <ProtectedRoute>
            <EditJob />
          </ProtectedRoute>
        )
      },
      {
        path: "/recruiter/profile",
        element: (
          <ProtectedRoute>
            <RecruiterProfile />
          </ProtectedRoute>
        )
      },
    ]
  }
])
function App() {

  return (
    <div>
      <RouterProvider router={appRouter} />
    </div>
  )
}

export default App
