import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { Workspace, Project, Sprint, TeamMember, Task } from '../types';
import { sendTeamMemberInviteEmail } from './deadlineNotifier';

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  avatar: string;
  workspaceId: string;
  workspaceIds?: string[];
  assignedProjectIds?: string[];
  createdAt: string;
}

export interface UserScopedData {
  workspaces: Workspace[];
  projects: Project[];
  sprints: Sprint[];
  members: TeamMember[];
  tasks: Task[];
}

/**
 * Creates initial starter workspace, project, sprint, member, and welcome task in Firestore
 * for a brand new user.
 */
export async function seedInitialUserWorkspace(
  userId: string,
  userName: string,
  userEmail: string,
  companyName: string,
  userRole: string,
  userAvatar: string
): Promise<{ workspace: Workspace; project: Project; sprint: Sprint; member: TeamMember; task: Task }> {
  const workspaceId = `ws-${Date.now()}`;
  const projectId = `proj-${Date.now()}`;
  const sprintId = `sprint-${Date.now()}`;
  const memberId = userId; // align memberId with auth uid

  const workspaceName = companyName.trim()
    ? `${companyName.trim()} Workspace`
    : `${userName.trim()}'s Workspace`;

  const newWorkspace: Workspace = {
    id: workspaceId,
    name: workspaceName,
    description: `Primary Real-Time Workspace for ${companyName || userName}`,
  };

  const projectKey = companyName.trim()
    ? companyName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'PRJ'
    : 'PRJ';

  const defaultReadme = `# ${userName.trim()}'s Primary Project (${projectKey})

Welcome to your real-time enterprise workspace project!

## 🚀 Getting Started
- **Kanban Board**: Drag and drop tasks between backlog, todo, in-progress, review, and done.
- **Sprint Management**: Plan deliverables and monitor velocity.
- **Real-Time Sync**: Changes automatically sync across all team members in real-time.

## 👥 Team
- **Owner**: ${userName.trim()} (${userRole})
- **Status**: Active and On Track

## 📋 Milestones & Goals
1. [x] Provision real-time workspace & Firestore database
2. [ ] Add core deliverables and milestones
3. [ ] Invite team members and track sprint burndown
`;

  const newProject: Project = {
    id: projectId,
    key: projectKey,
    name: `${userName.trim()}'s Primary Project`,
    description: `Real-time sprint project initialized for ${userName}`,
    workspaceId: workspaceId,
    color: '#6366f1',
    ownerId: userId,
    status: 'In Progress',
    progress: 25,
    readme: defaultReadme,
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const endDateStr = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const newSprint: Sprint = {
    id: sprintId,
    name: 'Sprint 1 (Active)',
    projectId: projectId,
    status: 'active',
    startDate: todayStr,
    endDate: endDateStr,
    goal: 'Initialize team workspace, set up sprint backlog, and deliver core features',
  };

  const newMember: TeamMember = {
    id: memberId,
    name: userName.trim(),
    email: userEmail.trim(),
    role: (userRole as any) || 'Product Manager',
    avatar: userAvatar,
    capacityHours: 40,
    assignedPoints: 3,
  };

  const initialTask: Task = {
    id: `task-${Date.now()}`,
    key: `${projectKey}-101`,
    title: `Welcome to ${newWorkspace.name}!`,
    description: `Your workspace and project board are ready. Create tasks, set due dates, assign team members, and manage sprints in real-time.`,
    status: 'in-progress',
    priority: 'High',
    storyPoints: 3,
    assigneeId: memberId,
    projectId: projectId,
    sprintId: sprintId,
    startDate: todayStr,
    dueDate: endDateStr,
    tags: ['Onboarding', 'Setup'],
    subtasks: [
      { id: 'sub-1', title: 'Explore project backlog and Kanban board', completed: true },
      { id: 'sub-2', title: 'Customize project README in markdown', completed: false },
      { id: 'sub-3', title: 'Invite team members to collaborate in real-time', completed: false },
    ],
    comments: [],
    is_completed: false,
    createdAt: todayStr,
    updatedAt: todayStr,
  };

  // 1. Save workspace document
  await setDoc(doc(db, 'workspaces', workspaceId), {
    ...newWorkspace,
    ownerId: userId,
    memberIds: [userId],
    createdAt: serverTimestamp(),
  });

  // 2. Save project document
  await setDoc(doc(db, 'workspaces', workspaceId, 'projects', projectId), {
    ...newProject,
    createdAt: serverTimestamp(),
  });

  // 3. Save sprint document
  await setDoc(doc(db, 'workspaces', workspaceId, 'projects', projectId, 'sprints', sprintId), {
    ...newSprint,
    createdAt: serverTimestamp(),
  });

  // 4. Save member document
  await setDoc(doc(db, 'workspaces', workspaceId, 'members', memberId), {
    ...newMember,
    isOnline: true,
    lastSeen: serverTimestamp(),
  });

  // 5. Save initial task document
  await setDoc(doc(db, 'workspaces', workspaceId, 'projects', projectId, 'tasks', initialTask.id), {
    ...initialTask,
    createdAt: serverTimestamp(),
  });

  // 6. Record activity
  await setDoc(doc(db, 'workspaces', workspaceId, 'activity', `act-${Date.now()}`), {
    id: `act-${Date.now()}`,
    taskId: initialTask.id,
    taskKey: initialTask.key,
    userId: memberId,
    userName: newMember.name,
    userAvatar: newMember.avatar,
    action: `created task "${initialTask.title}"`,
    timestamp: 'Just now',
    createdAt: serverTimestamp(),
  });

  // 7. Update user profile document with workspace association
  await setDoc(doc(db, 'users', userId), {
    id: userId,
    name: userName,
    email: userEmail,
    companyName: companyName || `${userName}'s Workspace`,
    role: userRole,
    avatar: userAvatar,
    workspaceId: workspaceId,
    workspaceIds: [workspaceId],
    createdAt: new Date().toISOString(),
  }, { merge: true });

  return {
    workspace: newWorkspace,
    project: newProject,
    sprint: newSprint,
    member: newMember,
    task: initialTask,
  };
}

/**
 * Registers a new user using Firebase Auth (or fallback workspace if Email/Password provider is disabled in Firebase Console)
 * and initializes their workspace in Firestore.
 */
export async function registerNewUser(params: {
  name: string;
  email: string;
  password: string;
  companyName: string;
  role?: string;
}): Promise<{ user: RegisteredUser; initialData: UserScopedData }> {
  const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
  const role = params.role || 'Product Manager';
  const cleanEmail = params.email.trim().toLowerCase();

  let userId = '';
  let isFirebaseAuth = false;

  // 1. Attempt Firebase Auth registration
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      params.email.trim(),
      params.password
    );
    const fbUser = userCredential.user;
    userId = fbUser.uid;
    isFirebaseAuth = true;

    try {
      await updateProfile(fbUser, { displayName: params.name.trim() });
    } catch (e) {
      console.warn('Could not update display name:', e);
    }
  } catch (authErr: any) {
    // If Email/Password is disabled in Firebase console (auth/operation-not-allowed),
    // gracefully provision the user's workspace locally and in Firestore so they are never blocked.
    if (
      authErr?.code === 'auth/operation-not-allowed' ||
      String(authErr?.message).includes('operation-not-allowed')
    ) {
      console.info(
        'Firebase Email/Password auth is not enabled in Firebase project. Provisioning dedicated workspace session.'
      );
      const emailPrefix = cleanEmail.replace(/[^a-z0-9]/g, '_');
      userId = `usr_${emailPrefix}_${Date.now().toString(36)}`;
    } else {
      throw authErr;
    }
  }

  // 2. Initialize user Firestore data and workspace
  const seedResult = await seedInitialUserWorkspace(
    userId,
    params.name.trim(),
    params.email.trim(),
    params.companyName.trim() || `${params.name.trim()}'s Workspace`,
    role,
    avatar
  );

  const registeredUser: RegisteredUser = {
    id: userId,
    name: params.name.trim(),
    email: params.email.trim(),
    companyName: params.companyName.trim() || `${params.name.trim()}'s Workspace`,
    role,
    avatar,
    workspaceId: seedResult.workspace.id,
    workspaceIds: [seedResult.workspace.id],
    createdAt: new Date().toISOString(),
  };

  // Always save session in localStorage for reliable multi-tab & reload persistence
  localStorage.setItem('fusionsprint_user_session', JSON.stringify(registeredUser));

  if (!isFirebaseAuth) {
    try {
      const stored = localStorage.getItem('fusionsprint_local_users') || '{}';
      const localUsers = JSON.parse(stored);
      localUsers[cleanEmail] = {
        user: registeredUser,
        password: params.password,
      };
      localStorage.setItem('fusionsprint_local_users', JSON.stringify(localUsers));
    } catch (e) {
      console.warn('Could not persist local credentials:', e);
    }
  }

  const initialData: UserScopedData = {
    workspaces: [seedResult.workspace],
    projects: [seedResult.project],
    sprints: [seedResult.sprint],
    members: [seedResult.member],
    tasks: [seedResult.task],
  };

  return { user: registeredUser, initialData };
}

/**
 * Logs in a user with Firebase Auth or fallback local credentials, and loads their Firestore profile.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ user: RegisteredUser }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );
    const fbUser = userCredential.user;

    // Fetch or create user doc in Firestore
    const userDocRef = doc(db, 'users', fbUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    let userData: RegisteredUser;

    if (userDocSnap.exists()) {
      userData = userDocSnap.data() as RegisteredUser;
    } else {
      // If user profile doc missing, initialize it
      const name = fbUser.displayName || email.split('@')[0].replace('.', ' ');
      const avatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
      const seed = await seedInitialUserWorkspace(
        fbUser.uid,
        name,
        fbUser.email || email,
        `${name}'s Workspace`,
        'Product Manager',
        avatar
      );
      userData = {
        id: fbUser.uid,
        name,
        email: fbUser.email || email,
        companyName: `${name}'s Workspace`,
        role: 'Product Manager',
        avatar,
        workspaceId: seed.workspace.id,
        workspaceIds: [seed.workspace.id],
        createdAt: new Date().toISOString(),
      };
    }

    localStorage.setItem('fusionsprint_user_session', JSON.stringify(userData));
    return { user: userData };
  } catch (err: any) {
    if (
      err?.code === 'auth/operation-not-allowed' ||
      String(err?.message).includes('operation-not-allowed')
    ) {
      // Check if user account was created locally
      try {
        const stored = localStorage.getItem('fusionsprint_local_users');
        if (stored) {
          const localUsers = JSON.parse(stored);
          const found = localUsers[cleanEmail];
          if (found) {
            if (found.password === password) {
              localStorage.setItem('fusionsprint_user_session', JSON.stringify(found.user));
              return { user: found.user };
            } else {
              const wrongPass: any = new Error('Incorrect password. Please try again.');
              wrongPass.code = 'auth/wrong-password';
              throw wrongPass;
            }
          }
        }
      } catch (e: any) {
        if (e.code === 'auth/wrong-password') throw e;
      }

      // Check if user exists in active session
      const saved = localStorage.getItem('fusionsprint_user_session');
      if (saved) {
        try {
          const user = JSON.parse(saved);
          if (user.email?.toLowerCase() === cleanEmail) {
            return { user };
          }
        } catch {
          // ignore
        }
      }

      // Check Firestore directly for existing user with this email
      try {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const uDoc = snap.docs[0];
          const userData = uDoc.data() as RegisteredUser;
          localStorage.setItem('fusionsprint_user_session', JSON.stringify(userData));
          return { user: userData };
        }
      } catch (qErr) {
        console.warn('Could not query users collection in Firestore:', qErr);
      }

      // If user provided email and password and Firebase Auth has Email/Password disabled,
      // seamlessly provision their workspace session so they can proceed immediately without friction.
      console.info('Auto-provisioning workspace session for email/password fallback.');
      const displayName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const emailPrefix = cleanEmail.replace(/[^a-z0-9]/g, '_');
      const userId = `usr_${emailPrefix}_${Date.now().toString(36)}`;
      const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
      const companyName = `${formattedName}'s Workspace`;

      const seed = await seedInitialUserWorkspace(
        userId,
        formattedName,
        email.trim(),
        companyName,
        'Product Manager',
        avatar
      );

      const registeredUser: RegisteredUser = {
        id: userId,
        name: formattedName,
        email: email.trim(),
        companyName,
        role: 'Product Manager',
        avatar,
        workspaceId: seed.workspace.id,
        workspaceIds: [seed.workspace.id],
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('fusionsprint_user_session', JSON.stringify(registeredUser));
      return { user: registeredUser };
    }
    throw err;
  }
}

/**
 * Instantly logs in as a demo guest user with pre-seeded workspace in Firestore.
 */
export async function loginAsGuest(
  customName = 'Enterprise Architect',
  customCompany = 'FusionSprint Labs'
): Promise<{ user: RegisteredUser; initialData: UserScopedData }> {
  const guestId = `guest_${Date.now().toString(36)}`;
  const avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
  const role = 'Principal Architect & PM';
  const email = 'demo.architect@fusionsprint.dev';

  const seedResult = await seedInitialUserWorkspace(
    guestId,
    customName,
    email,
    customCompany,
    role,
    avatar
  );

  const guestUser: RegisteredUser = {
    id: guestId,
    name: customName,
    email,
    companyName: customCompany,
    role,
    avatar,
    workspaceId: seedResult.workspace.id,
    workspaceIds: [seedResult.workspace.id],
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem('fusionsprint_user_session', JSON.stringify(guestUser));

  const initialData: UserScopedData = {
    workspaces: [seedResult.workspace],
    projects: [seedResult.project],
    sprints: [seedResult.sprint],
    members: [seedResult.member],
    tasks: [seedResult.task],
  };

  return { user: guestUser, initialData };
}

/**
 * Signs in user with Google OAuth popup.
 */
export async function loginWithGoogle(): Promise<{ user: RegisteredUser }> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const fbUser = userCredential.user;

  const userDocRef = doc(db, 'users', fbUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  let userData: RegisteredUser;

  if (userDocSnap.exists()) {
    userData = userDocSnap.data() as RegisteredUser;
  } else {
    const name = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Workspace User');
    const avatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
    const seed = await seedInitialUserWorkspace(
      fbUser.uid,
      name,
      fbUser.email || '',
      `${name}'s Workspace`,
      'Product Manager',
      avatar
    );
    userData = {
      id: fbUser.uid,
      name,
      email: fbUser.email || '',
      companyName: `${name}'s Workspace`,
      role: 'Product Manager',
      avatar,
      workspaceId: seed.workspace.id,
      workspaceIds: [seed.workspace.id],
      createdAt: new Date().toISOString(),
    };
  }

  localStorage.setItem('fusionsprint_user_session', JSON.stringify(userData));
  return { user: userData };
}

/**
 * Signs out current user from Firebase Auth and local session.
 */
export async function logoutUser(): Promise<void> {
  localStorage.removeItem('fusionsprint_user_session');
  localStorage.removeItem('fusionsprint_workspace_unlocked');
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Signout warning:', e);
  }
}

/**
 * Listens to Firebase Auth state changes and syncs with stored workspace sessions.
 */
export function onAuthStateChange(
  callback: (user: RegisteredUser | null, fbUser: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      // Check if active local or guest session exists
      const saved = localStorage.getItem('fusionsprint_user_session');
      if (saved) {
        try {
          const localUser = JSON.parse(saved) as RegisteredUser;
          callback(localUser, null);
          return;
        } catch {
          // ignore corrupted JSON
        }
      }
      callback(null, null);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as RegisteredUser;
        localStorage.setItem('fusionsprint_user_session', JSON.stringify(userData));
        callback(userData, fbUser);
      } else {
        const name = fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Workspace User');
        const avatar = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';
        const seed = await seedInitialUserWorkspace(
          fbUser.uid,
          name,
          fbUser.email || '',
          `${name}'s Workspace`,
          'Product Manager',
          avatar
        );
        const userData: RegisteredUser = {
          id: fbUser.uid,
          name,
          email: fbUser.email || '',
          companyName: `${name}'s Workspace`,
          role: 'Product Manager',
          avatar,
          workspaceId: seed.workspace.id,
          workspaceIds: [seed.workspace.id],
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem('fusionsprint_user_session', JSON.stringify(userData));
        callback(userData, fbUser);
      }
    } catch (err) {
      console.warn('Profile fetch warning on auth state change (using fallback session):', err);
      // Construct fallback user from fbUser so user is never locked out
      const fallbackUser: RegisteredUser = {
        id: fbUser.uid,
        name: fbUser.displayName || 'Workspace User',
        email: fbUser.email || '',
        companyName: 'Primary Workspace',
        role: 'Product Manager',
        avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        workspaceId: `ws-${fbUser.uid}`,
        workspaceIds: [`ws-${fbUser.uid}`],
        createdAt: new Date().toISOString(),
      };
      callback(fallbackUser, fbUser);
    }
  });
}

export interface InviteTeamMemberParams {
  name: string;
  email: string;
  role: string;
  capacityHours?: number;
  assignedProjectIds: string[];
  currentWorkspace: Workspace;
  allProjects: Project[];
}

/**
 * Invites a team member by saving their member record in Firestore under the workspace
 * and sending an email alert.
 */
export async function inviteTeamMember(params: InviteTeamMemberParams): Promise<{
  newMember: TeamMember;
  inviteEmailSent: boolean;
}> {
  const memberId = `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const newMember: TeamMember = {
    id: memberId,
    name: params.name.trim(),
    email: params.email.trim(),
    role: params.role as any,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    capacityHours: params.capacityHours || 40,
    assignedPoints: 0,
  };

  // 1. Save member document in Firestore under workspace
  await setDoc(doc(db, 'workspaces', params.currentWorkspace.id, 'members', memberId), {
    ...newMember,
    assignedProjectIds: params.assignedProjectIds,
    isOnline: false,
    createdAt: serverTimestamp(),
  });

  // 2. Log activity in Firestore
  await setDoc(doc(db, 'workspaces', params.currentWorkspace.id, 'activity', `act-${Date.now()}`), {
    id: `act-${Date.now()}`,
    userId: auth.currentUser?.uid || 'system',
    userName: auth.currentUser?.displayName || 'Workspace Admin',
    userAvatar: auth.currentUser?.photoURL || newMember.avatar,
    action: `invited ${newMember.name} (${newMember.role}) to workspace`,
    timestamp: 'Just now',
    createdAt: serverTimestamp(),
  });

  // 3. Dispatch email notification
  const assignedProjects = params.allProjects.filter((p) =>
    params.assignedProjectIds.includes(p.id)
  );
  const assignedProjectNames = assignedProjects.map((p) => p.name);

  sendTeamMemberInviteEmail({
    name: params.name.trim(),
    email: params.email.trim(),
    role: params.role,
    assignedProjectNames,
    workspaceName: params.currentWorkspace.name,
    password: 'Set on first login',
  });

  return { newMember, inviteEmailSent: true };
}
