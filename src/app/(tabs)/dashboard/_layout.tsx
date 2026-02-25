import {Stack} from "expo-router";
import {useLargeHeaderOptions} from "@/constants/navigation-options";

export default function DashboardLayout() {
    const largeHeader = useLargeHeaderOptions();

    return <Stack
        screenOptions={{
            title: "Dashboard",
            ...largeHeader
        }}
    />;
}
