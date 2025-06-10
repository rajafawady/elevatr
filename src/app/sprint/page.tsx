"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your sprints</h1>
          <p className="text-muted-foreground">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your sprints...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Sprints</h1>
          <p className="text-muted-foreground mt-2">
            Manage your career development sprints and track your progress
          </p>
        </div>
        <Link href="/sprint/new">
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            New Sprint
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive font-medium">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}

      {sprints.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sprints yet</h3>
          <p className="text-muted-foreground mb-6">
            Start your career development journey by creating your first sprint.
          </p>
          <Link href="/sprint/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Sprint
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <Card key={sprint.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{sprint.title}</CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {sprint.description}
                    </CardDescription>
                  </div>                  <Badge className={getStatusColor(sprint.status || 'planning')} variant="secondary">
                    {sprint.status || 'planning'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">                  <div className="flex items-center text-sm text-muted-foreground">
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
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/sprint/${sprint.id}/edit`} className="flex-1">
                      <Button variant="default" size="sm" className="w-full">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
