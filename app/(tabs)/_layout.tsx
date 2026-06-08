import { Tabs } from "expo-router";
import { BottomNav } from "../../components/ui/BottomNav";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="samples" />
      <Tabs.Screen name="reminders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
