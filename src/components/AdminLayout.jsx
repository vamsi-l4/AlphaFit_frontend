import Layout from './Layout';

export default function AdminLayout({ children }) {
  return (
    <Layout bottomNav headerProps={{ logoutTo: '/admin/login' }}>
      {children}
    </Layout>
  );
}
