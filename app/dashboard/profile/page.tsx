"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, Briefcase, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useProfile } from "@/hooks/use-profile"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const { profile, isLoading, updateProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    organization: "",
    bio: "",
  })

  // Initialiser le formulaire avec les données du profil
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        role: profile.role || "avocat",
        organization: profile.organization || "",
        bio: profile.bio || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role: formData.role,
      organization: formData.organization,
      bio: formData.bio,
    })

    if (result.success) {
      toast.success("Profil mis à jour avec succès")
      setIsEditing(false)
    } else {
      toast.error("Erreur lors de la mise à jour du profil")
    }
  }

  if (isLoading) {
    return <div className="space-y-6">Chargement...</div>
  }

  if (!profile) {
    return <div className="space-y-6">Profil non trouvé</div>
  }

  const fullName = profile.name || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Utilisateur"
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const getRoleName = (role: string | null) => {
    const roleMap: Record<string, string> = {
      avocat: "Avocat",
      associe: "Associé",
      collaborateur: "Collaborateur",
      juriste: "Juriste d'entreprise",
    }
    return roleMap[role || "avocat"] || role || "Avocat"
  }

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient mesh background */}
      <div className="gradient-mesh fixed inset-0 -z-10" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-5xl font-bold mb-2 text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground text-lg">Gérez vos informations personnelles et professionnelles</p>
        </div>

        {/* Profile Header Card */}
        <Card className="card-premium border-glow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarFallback className="bg-primary/10 text-4xl text-primary">{initials}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm">
                Changer la photo
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-muted-foreground">{profile.bio || getRoleName(profile.role)}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.organization && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.organization}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Badge className="bg-primary/10 text-primary">{getRoleName(profile.role)}</Badge>
                <Badge className="bg-accent/10 text-accent-foreground">Plan {profile.plan === "FREEMIUM" ? "Freemium" : "Standard"}</Badge>
                <Badge className="bg-green-500/10 text-green-600">Actif</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Edit Profile Form */}
        <Card className="glass-premium border-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-2xl">Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations de profil</CardDescription>
              </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Annuler" : "Modifier"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={isEditing ? formData.firstName : profile.firstName || ""}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={isEditing ? formData.lastName : profile.lastName || ""}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email professionnel</Label>
            <Input id="email" type="email" value={profile.email} disabled />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={isEditing ? formData.phone : profile.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Fonction</Label>
              <Select
                value={isEditing ? formData.role : profile.role || "avocat"}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={!isEditing}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avocat">Avocat</SelectItem>
                  <SelectItem value="associe">Associé</SelectItem>
                  <SelectItem value="collaborateur">Collaborateur</SelectItem>
                  <SelectItem value="juriste">Juriste d'entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization">Organisation</Label>
            <Input
              id="organization"
              value={isEditing ? formData.organization : profile.organization || ""}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biographie professionnelle</Label>
            <Textarea
              id="bio"
              placeholder="Parlez-nous de votre parcours et expertise..."
              value={isEditing ? formData.bio : profile.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[120px]"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave}>
                Enregistrer les modifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Activity Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="card-premium border-glow group hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Projets actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.stats?.projects || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total projets</p>
            </CardContent>
          </Card>

          <Card className="card-premium border-glow group hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Documents traités</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.stats?.documents || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total documents</p>
            </CardContent>
          </Card>

          <Card className="card-premium border-glow group hover-lift">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Collaborations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile.stats?.collaborations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Projets collaboratifs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
