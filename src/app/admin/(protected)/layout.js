import NavigationView from "./Navigation/NavigationView"
export default function ProtectedAdminLayout({ children }) {
  return (
    <NavigationView>
      {children}
    </NavigationView>
  )
} 