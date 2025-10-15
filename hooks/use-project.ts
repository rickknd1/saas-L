import { useQuery } from '@tanstack/react-query'

interface ProjectMember {
  id: string
  userId: string
  projectId: string
  role: string
  invitedAt: string
  acceptedAt: string | null // null = invitation en attente, non-null = membre accepté
  user: {
    id: string
    name: string | null
    email: string
    avatar?: string | null
  }
}

interface ProjectDocument {
  id: string
  name: string
  type: string
  size: number
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  confidential: boolean
  deadline: string | null
  createdAt: string
  updatedAt: string
  ownerId: string
  owner: {
    id: string
    name: string | null
    email: string
  }
  members: ProjectMember[]
  documents: ProjectDocument[]
  _count: {
    members: number
    documents: number
  }
  userRole?: string
}

interface UseProjectReturn {
  project: Project | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook pour récupérer les détails d'un projet
 * @param projectId - ID du projet
 * @param userId - ID de l'utilisateur connecté
 */
export function useProject(projectId: string, userId: string | undefined): UseProjectReturn {
  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; project: Project }>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`, {
        credentials: 'include',
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to load project')
      }

      return res.json()
    },
    enabled: !!projectId && !!userId,
  })

  return {
    project: data?.project,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}
