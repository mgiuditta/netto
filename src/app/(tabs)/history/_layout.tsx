import {Stack} from "expo-router";
import {useLargeHeaderOptions} from "@/constants/navigation-options";

export default function HistoryLayout() {
    const largeHeader = useLargeHeaderOptions();

    return <Stack screenOptions={{
        title: "Cronologia",
        ...largeHeader
    }}/>;
}
