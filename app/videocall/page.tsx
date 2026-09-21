import type { Metadata } from "next";
import { VideocallMockup } from "./videocall-mockup";

export const metadata: Metadata = {
  title: "Tele-consulta | KintalVax",
  description: "Mockup de tele-consulta do Kintal Vax.",
};

export default function VideocallPage() {
  return <VideocallMockup />;
}
