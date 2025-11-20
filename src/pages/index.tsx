import { MainLayout } from "@/layout";
import { HomePage } from "./home";

export default function Home() {
  return (
    <div>
      <MainLayout>
        <HomePage />
      </MainLayout>
    </div>
  );
}
