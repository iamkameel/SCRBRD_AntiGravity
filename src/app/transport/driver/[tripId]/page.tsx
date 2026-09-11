"use client";

import { useParams } from "next/navigation";
import { DriverMobileInterface } from "@/components/transport/DriverMobileInterface";

export default function DriverTripPage() {
  const params = useParams();
  const tripId = (params?.tripId as string) || "TRIP-101";

  return <DriverMobileInterface tripId={tripId} />;
}
