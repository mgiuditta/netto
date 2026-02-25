import {Stack} from "expo-router";
import {useLargeHeaderOptions} from "@/constants/navigation-options";

export default function InsightsLayout() {
    const largeHeader = useLargeHeaderOptions();

    return <Stack screenOptions={{title: "Impostazioni", ...largeHeader}}/>;
}
