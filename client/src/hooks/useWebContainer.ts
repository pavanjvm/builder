import { useEffect, useState } from "react";
import { WebContainer } from '@webcontainer/api';

let bootPromise: Promise<WebContainer> | undefined;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();

    async function main() {
        if (webcontainer) return;

        console.log('useWebContainer: Attempting to boot WebContainer');

        // Use singleton pattern - only boot once globally
        if (!bootPromise) {
            console.log('useWebContainer: First time booting WebContainer');
            bootPromise = WebContainer.boot();
        } else {
            console.log('useWebContainer: Reusing existing bootPromise');
        }

        const webcontainerInstance = await bootPromise;
        setWebcontainer(webcontainerInstance);
        console.log('useWebContainer: WebContainer ready');
    }

    useEffect(() => {
        main();
    }, [])

    return webcontainer;
}