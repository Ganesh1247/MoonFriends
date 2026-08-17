'use client';

import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUserRole } from '@/lib/actions/users';
import { getExpenseCategories, createExpenseCategory } from '@/lib/actions/categories';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Settings,
  Users,
  Shield,
  Tag,
  Plus,
  Loader2,
} from 'lucide-react';
import type { AppUser, ExpenseCategory, UserRole } from '@/types';

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('volunteer');
  const [creatingUser, setCreatingUser] = useState(false);

  // Add Category State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  const loadData = async () => {
    const [uRes, cRes] = await Promise.all([getUsers(), getExpenseCategories()]);
    if (uRes.success && uRes.data) setUsers(uRes.data);
    if (cRes.success && cRes.data) setCategories(cRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim() || !newPhone.trim()) {
      toast.error('All user fields are required');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await createUser({
        email: newEmail.trim(),
        password: newPassword.trim() || 'MoonFriends2026!',
        fullName: newName.trim(),
        phone: newPhone.trim(),
        role: newRole,
      });

      if (res.success) {
        toast.success(`User ${newName} added with role ${newRole}`);
        setUserModalOpen(false);
        setNewEmail('');
        setNewPassword('');
        setNewName('');
        setNewPhone('');
        loadData();
      } else {
        toast.error(res.error || 'Failed to create user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.error('Category name is required');
      return;
    }

    setCreatingCat(true);
    try {
      const res = await createExpenseCategory(newCatName.trim());
      if (res.success) {
        toast.success(`Custom category "${newCatName}" added`);
        setCatModalOpen(false);
        setNewCatName('');
        loadData();
      } else {
        toast.error(res.error || 'Failed to create category');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating category');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleRoleChange = async (uid: string, role: UserRole) => {
    try {
      const res = await updateUserRole(uid, role);
      if (res.success) {
        toast.success('User role updated');
        loadData();
      } else {
        toast.error(res.error || 'Failed to update role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating role');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold mb-1">
          <Settings className="w-3.5 h-3.5" /> Administration & Role-Based Access Control
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          System Settings & Permissions
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Manage committee member roles (Admin / Treasurer / Volunteer), expense heads, and platform configuration
        </p>
      </div>

      {/* ── 1. Committee User Role Management ────────────────────── */}
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" /> Committee Member Access Control (RBAC)
            </CardTitle>
            <CardDescription className="text-xs">
              Admins have full control. Treasurers manage funds. Volunteers enter collections.
            </CardDescription>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setUserModalOpen(true)}
              className="bg-gold hover:bg-gold-dark text-night-deep font-bold shadow-md h-9 text-xs"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-background/60">
                <TableRow>
                  <TableHead className="text-xs font-bold text-gold">Name</TableHead>
                  <TableHead className="text-xs font-bold">Email</TableHead>
                  <TableHead className="text-xs font-bold">Phone</TableHead>
                  <TableHead className="text-xs font-bold">Assigned Role</TableHead>
                  {isAdmin && <TableHead className="text-xs font-bold text-right">Modify Role</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.uid} className="hover:bg-accent/20">
                    <TableCell className="font-semibold text-sm">{u.fullName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{u.email}</TableCell>
                    <TableCell className="text-xs">{u.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          u.role === 'admin'
                            ? 'border-gold text-gold bg-gold/5'
                            : u.role === 'treasurer'
                            ? 'border-money-in text-money-in bg-money-in/5'
                            : 'border-blue-400 text-blue-400 bg-blue-500/5'
                        }`}
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          className="h-8 rounded-md bg-background/80 border border-border/60 text-xs px-2"
                        >
                          <option value="admin">Admin</option>
                          <option value="treasurer">Treasurer</option>
                          <option value="volunteer">Volunteer</option>
                        </select>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Expense Category Manager ──────────────────────────── */}
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Tag className="w-5 h-5 text-saffron" /> Custom Expense Categories
            </CardTitle>
            <CardDescription className="text-xs">
              Manage pre-set and custom budget categories for festival spending
            </CardDescription>
          </div>
          <Button
            onClick={() => setCatModalOpen(true)}
            variant="outline"
            className="border-saffron/40 text-saffron hover:bg-saffron/10 h-9 text-xs"
          >
            <Plus className="w-4 h-4 mr-1" /> New Category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge
                key={c.id}
                variant="outline"
                className="p-2 border-border/50 text-xs font-semibold bg-card/60"
              >
                {c.name} {c.isSystem ? '(System)' : '(Custom)'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={userModalOpen} onOpenChange={setUserModalOpen}>
        <DialogContent className="glass border-gold/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-gold">
              Add Committee Member
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Full Name *</Label>
              <Input
                placeholder="e.g. Anand Sharma"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Email *</Label>
                <Input
                  type="email"
                  placeholder="anand@moonfriends.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone *</Label>
                <Input
                  placeholder="9849012345"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Password</Label>
                <Input
                  type="password"
                  placeholder="Default: MoonFriends2026!"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Role *</Label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full h-9 rounded-md bg-background/80 border border-border/60 text-xs px-2"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUserModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingUser} className="bg-gold hover:bg-gold-dark text-night-deep font-bold">
                {creatingUser ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Create Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="glass border-saffron/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gradient-saffron">
              Create Expense Category
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category Name *</Label>
              <Input
                placeholder="e.g. VIP Prasadam Boxes"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingCat} className="bg-saffron hover:bg-saffron/90 text-white font-bold">
                {creatingCat ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
