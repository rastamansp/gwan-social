import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import IndexPage from '@/pages/IndexPage'
import NearbyPage from '@/pages/NearbyPage'
import NotFoundPage from '@/pages/NotFoundPage'
import PostPage from '@/pages/PostPage'
import CreatePostStepConteudo from '@/pages/create-post/CreatePostStepConteudo'
import CreatePostStepMidia from '@/pages/create-post/CreatePostStepMidia'
import CreatePostStepRevisao from '@/pages/create-post/CreatePostStepRevisao'
import CreatePostWizardPage from '@/pages/create-post/CreatePostWizardPage'
import EditProfilePage from '@/pages/EditProfilePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import UserProfilePage from '@/pages/UserProfilePage'
import PresentationPage from '@/pages/PresentationPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/presentation" element={<PresentationPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<AppShell />}>
          <Route path="/" element={<IndexPage />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/user/:userId/create-post" element={<CreatePostWizardPage />}>
            <Route index element={<Navigate to="content" replace />} />
            <Route path="content" element={<CreatePostStepConteudo />} />
            <Route path="media" element={<CreatePostStepMidia />} />
            <Route path="review" element={<CreatePostStepRevisao />} />
          </Route>
          <Route path="/user/:userId/edit" element={<EditProfilePage />} />
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/nearby" element={<NearbyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
