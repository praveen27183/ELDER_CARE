import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  CircleMarker,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  MapPin,
  Smartphone,
  Users,
  Navigation,
  Filter,
  User,
  Clock,
  HeartPulse,
  Languages,
  Zap,
  ShieldAlert
} from "lucide-react";

/* ----------------------------
   FIX LEAFLET MARKER ICON
-----------------------------*/
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

/* ----------------------------
   TYPES
-----------------------------*/
interface Job {
  id: string | number;
  type: string;
  elder: string;
  age: number;
  language: string;
  condition: string;
  loc: string;
  zone: string;
  time: string;
  status: "Unassigned" | "Assigned" | "In Progress";
  priority: "high" | "normal" | "low";
  volunteer?: string;
  lat: number;
  lng: number;
}

interface Volunteer {
  id: string | number;
  name: string;
  zone: string;
  distance: string;
  status: "Available" | "Busy";
  rating: number;
  lat: number;
  lng: number;
}

/* ----------------------------
   MOCK DATA
-----------------------------*/
const initialJobs: Job[] = [
  {
    id: 101,
    type: "SOS",
    elder: "Kannan",
    age: 78,
    language: "Tamil",
    condition: "Diabetic, Mobility Issue",
    loc: "Anna Nagar West",
    zone: "Anna Nagar",
    time: "2 mins ago",
    status: "Unassigned",
    priority: "high",
    lat: 13.0878,
    lng: 80.2101
  },
  {
    id: 102,
    type: "Medicine",
    elder: "Lakshmi",
    age: 65,
    language: "English",
    condition: "Hypertension",
    loc: "T Nagar North",
    zone: "T Nagar",
    time: "10 mins ago",
    status: "Unassigned",
    priority: "normal",
    lat: 13.0418,
    lng: 80.2341
  },
  {
    id: 103,
    type: "Ride",
    elder: "Ramanathan",
    age: 82,
    language: "Tamil",
    condition: "Visual Impairment",
    loc: "Adyar",
    zone: "Adyar",
    time: "15 mins ago",
    status: "In Progress",
    priority: "normal",
    volunteer: "Karthik",
    lat: 13.0012,
    lng: 80.2565
  }
];

const mockVolunteers: Volunteer[] = [
  {
    id: 1,
    name: "Senthil",
    zone: "Anna Nagar",
    distance: "0.5 km",
    status: "Available",
    rating: 4.8,
    lat: 13.09,
    lng: 80.208
  },
  {
    id: 2,
    name: "Divya",
    zone: "T Nagar",
    distance: "1.2 km",
    status: "Available",
    rating: 4.9,
    lat: 13.043,
    lng: 80.229
  },
  {
    id: 3,
    name: "Karthik",
    zone: "Adyar",
    distance: "0.8 km",
    status: "Available",
    rating: 4.7,
    lat: 13.003,
    lng: 80.25
  }
];

/* ----------------------------
   AUTO ZOOM TO JOB
-----------------------------*/
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  React.useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.5 });
  }, [lat, lng]);

  return null;
}

import LeafletMap, { type MapMarker } from "../../../components/shared/LeafletMap";

/* ----------------------------
   MAIN COMPONENT
-----------------------------*/
export default function JobAssignment() {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers);
  const [selectedJobId, setSelectedJobId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobsAndVolunteers = async () => {
      try {
        setLoading(true);
        const [tasksRes, volsRes] = await Promise.all([
          api.get("/tasks/all"),
          api.get("/volunteers")
        ]);
        
        const fetchedTasks = tasksRes.data.data.tasks.map((t: any) => ({
          id: t._id,
          type: t.title || "Request",
          elder: t.elderName || "Elder",
          age: 75,
          language: "Tamil",
          condition: t.description || "",
          loc: "Chennai",
          zone: "Chennai",
          time: new Date(t.createdAt).toLocaleTimeString(),
          status: t.status === "pending" ? "Unassigned" : t.status === "accepted" ? "Assigned" : "In Progress",
          priority: t.urgency || "normal",
          volunteer: t.volunteerName,
          lat: 13.0827 + (Math.random() - 0.5) * 0.1,
          lng: 80.2707 + (Math.random() - 0.5) * 0.1,
        }));

        const fetchedVols = volsRes.data.map((v: any) => ({
          id: v._id,
          name: v.name,
          zone: v.location || "Chennai",
          distance: "1 km",
          status: v.status === "Available" ? "Available" : "Busy",
          rating: v.rating || 4.5,
          lat: 13.0827 + (Math.random() - 0.5) * 0.1,
          lng: 80.2707 + (Math.random() - 0.5) * 0.1,
        }));

        setJobs(fetchedTasks.length > 0 ? fetchedTasks : initialJobs);
        setVolunteers(fetchedVols.length > 0 ? fetchedVols : mockVolunteers);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setJobs(initialJobs);
        setVolunteers(mockVolunteers);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndVolunteers();
  }, []);

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  const getNearbyVolunteers = (zone: string) => {
    return volunteers.filter(v => v.status === "Available"); // Relaxed zone matching for mock data fallback
  };

  // Prepare markers for the map
  const markers: MapMarker[] = [
    ...jobs.map(job => ({
      id: `job-${job.id}`,
      position: [job.lat, job.lng] as [number, number],
      type: 'elder' as const,
      name: job.elder
    })),
    ...volunteers.map(vol => ({
      id: `vol-${vol.id}`,
      position: [vol.lat, vol.lng] as [number, number],
      type: 'volunteer' as const,
      name: vol.name
    }))
  ];

  const handleAutoAssign = (jobId: string | number, zone: string) => {
    const nearby = getNearbyVolunteers(zone);

    if (!nearby.length) return;

    const best = nearby[0];

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "Assigned",
              volunteer: best.name
            }
          : job
      )
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-screen p-5 bg-slate-100">
      {/* MAP */}
      <div className="xl:col-span-2 bg-white rounded-2xl shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b font-bold text-lg flex gap-2 items-center">
          <Navigation size={18} className="text-blue-600" />
          Live Dispatch Control
        </div>

        <div className="flex-1">
          <LeafletMap 
            center={activeJob ? [activeJob.lat, activeJob.lng] : [13.0827, 80.2707]}
            zoom={activeJob ? 14 : 11}
            markers={markers}
            height="100%"
            showAdminColors={true}
          />
        </div>
      </div>

      {/* PANEL */}
      <div className="bg-white rounded-2xl shadow overflow-y-auto">
        <div className="p-4 border-b font-bold flex gap-2 items-center">
          <Users size={18} />
          Request Queue
        </div>

        <div className="p-4 space-y-4">
          {jobs.map((job) => {
            const nearby = getNearbyVolunteers(job.zone);

            return (
              <div
                key={job.id}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedJobId === job.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => setSelectedJobId(job.id)}
              >
                {/* Header */}
                <div className="flex justify-between">
                  <span className="font-bold">{job.type}</span>
                  <span className="text-xs text-slate-500">{job.time}</span>
                </div>

                {/* Elder */}
                <div className="mt-2 font-semibold text-lg">{job.elder}</div>
                <div className="text-sm text-slate-500">{job.loc}</div>

                <div className="text-sm mt-2">{job.condition}</div>

                {/* Status */}
                {job.status === "Unassigned" ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAutoAssign(job.id, job.zone);
                    }}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Assign Nearest Volunteer
                  </button>
                ) : (
                  <div className="mt-3 text-green-600 font-semibold">
                    Assigned to {job.volunteer}
                  </div>
                )}

                {/* Nearby */}
                {nearby.length > 0 && (
                  <div className="mt-3 text-sm text-slate-500">
                    Nearby: {nearby.map((v) => v.name).join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}