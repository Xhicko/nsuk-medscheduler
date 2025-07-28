import NavigationView from "./Navigation/NaviationView"
export default function ProtectedAdminLayout({ children }) {
  return (
    <NavigationView>
      {children}
    </NavigationView>
  )
} 