"use client";

import { useState, useEffect } from "react";
import { ElevatrButton } from "@/components/ui/ElevatrButton";
import { ElevatrCard } from "@/components/ui/ElevatrCard";
import { ElevatrNotification } from "@/components/ui/ElevatrNotification";
import { Sprint } from "@/types";
import { getSprintsByUser } from "@/services/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Target } from "lucide-react";
import Link from "next/link";

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadSprints = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const userSprints = await getSprintsByUser(user.uid);
        setSprints(userSprints);
      } catch (err) {
        console.error("Error loading sprints:", err);
        setError("Failed to load sprints. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadSprints();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  if (!user) {
    return (
      <div className="elevatr-container py-8">
        <ElevatrNotification
          type="info"
          title="Authentication Required"
          message="Please sign in to view your sprints."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="elevatr-container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="elevatr-animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground elevatr-animate-pulse">Loading your sprints...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-4 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 elevatr-animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold elevatr-gradient-text">My Sprints</h1>
          <p className="text-muted-foreground mt-2">
            Manage your career development sprints and track your progress
          </p>
        </div>
        <Link href="/sprint/new">
          <ElevatrButton variant="motivation" className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            New Sprint
          </ElevatrButton>
        </Link>
      </div>

      {error && (
        <ElevatrNotification
          type="error"
          title="Error Loading Sprints"
          message={error}
          action={{
            label: "Try Again",
            onClick: () => window.location.reload()
          }}
        />
      )}

      {sprints.length === 0 && !loading ? (        <ElevatrNotification
          type="info"
          title="No sprints yet"
          message="Start your career development journey by creating your first sprint."
          icon={<Target className="h-5 w-5" />}
          action={{
            label: "Create Your First Sprint",
            onClick: () => window.location.href = "/sprint/new"
          }}
        />
      ) : (        <div className="elevatr-grid">
          {sprints.map((sprint, index) => (
            <ElevatrCard 
              key={sprint.id} 
       
            
              className={`elevatr-animate-fade-in elevatr-animate-delay-${Math.min(index + 1, 6)}`}
            >
              <div className="elevatr-card-header">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold line-clamp-2">{sprint.title}</h3>
                    <p className="text-muted-foreground mt-1 line-clamp-2">
                      {sprint.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sprint.status || 'planning')}`}>
                    {sprint.status || 'planning'}
                  </span>
                </div>
              </div>
              <div className="elevatr-card-content">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="mr-2 h-4 w-4" />
                    <span>{sprint.duration} day sprint</span>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Link href={`/sprint/${sprint.id}`} className="flex-1">
                      <ElevatrButton variant="secondary" size="sm" className="w-full">
                        View Details
                      </ElevatrButton>
                    </Link>
                    <Link href={`/sprint/${sprint.id}/edit`} className="flex-1">
                      <ElevatrButton variant="primary" size="sm" className="w-full">
                        Edit
                      </ElevatrButton>
                    </Link>
                  </div>
                </div>
              </div>
            </ElevatrCard>
          ))}
        </div>
      )}
    </div>
  );
}
