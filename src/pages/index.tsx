import { MainLayout } from "@/layout";
import { ProtectedRoute } from "@/routes";

export default function Home() {
  return (
    <div>
      <ProtectedRoute>
        <MainLayout>
          <div></div>
        </MainLayout>
      </ProtectedRoute>
    </div>
  );
}
