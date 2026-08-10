# How do you use this Repo for Dashboard...

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Sidebar.jsx       # Navigation sidebar (desktop fixed, mobile drawer)
│       └── Header.jsx        # Top header (hamburger menu, profile, search)
├── layout/
│   └── DashboardLayout.jsx   # Main layout wrapper using Outlet
├── pages/
│   └── Home.jsx              # Default dashboard home page
├── router/
│   └── router.jsx            # Route definitions
├── App.jsx
└── main.jsx
```

## 🛠️ How to Customize

### 1. Add a New Page

Create a new component in the `src/pages` directory. For example, `src/pages/Users.jsx`.

```jsx
// src/pages/Users.jsx
export default function Users() {
  return <div className="p-4 text-white">Users Management Page</div>;
}
```

### 2. Add the Route

Update `src/router/router.jsx` to include your new page.

```jsx
import Users from "../pages/Users";

// ... inside the children array of DashboardLayout
children: [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/users",
    element: <Users />,
  },
],
```

### 3. Update the Sidebar Link

Open `src/components/layout/Sidebar.jsx` and add the new link to the `navLinks` array.

```jsx
import { Users } from "lucide-react"; // Import an icon

const navLinks = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Users", path: "/users", icon: Users }, // Add this line
  // ...
];
```

## 📚 Usage Guide

### Using React Hook Form
Manage form state and validation easily.

```jsx
import { useForm } from "react-hook-form";

export default function ExampleForm() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input {...register("username")} placeholder="Username" className="p-2 border rounded" />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
    </form>
  );
}
```

### Using React Query
Fetch and cache server data efficiently.

```jsx
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function DataFetcher() {
  const { isPending, error, data } = useQuery({
    queryKey: ['repoData'],
    queryFn: () =>
      axios.get('https://api.github.com/repos/tannerlinsley/react-query').then((res) => res.data),
  });

  if (isPending) return 'Loading...';
  if (error) return 'An error has occurred: ' + error.message;

  return <div><h1>{data.name}</h1><p>{data.description}</p></div>;
}
```

### Using Tailwind Merge (`cn`)
Use the `cn` utility to merge Tailwind classes and handle conditional logic without conflicts.

```jsx
import { cn } from "../lib/utils";

export default function Button({ className, variant = "primary", children }) {
  return (
    <button 
      className={cn(
        "px-4 py-2 rounded font-medium transition-colors", // Base classes
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300",
        className // Allow overriding classes via props
      )}
    >
      {children}
    </button>
  );
}
```

## Dependencies

```
dependencies: {
    "@iconify/react": "^6.0.2",
    "@tanstack/react-query": "^5.0.0",
    "@tailwindcss/vite": "^4.1.18",
    "axios": "^1.13.2",
    "clsx": "^2.1.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.0.0",
    "react-router-dom": "^7.11.0",
    "tailwindcss": "^4.1.18",
    "tailwind-merge": "^2.2.0"
  },
```
