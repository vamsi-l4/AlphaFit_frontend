import Layout from './Layout';

export default function AdminLayout({ children }) {
  return (
    <Layout sidebar bottomNav mobileHeaderOnly>
      {children}
    </Layout>
  );
}
