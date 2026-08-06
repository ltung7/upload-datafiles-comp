<script lang="ts" generic="T">
    import type { DataFilesDescriptor, DataFilesType, DataFilePreprocessResult } from "./index.d";
    import { generateFileTypes } from "./common";
    import Dropzone from "svelte-file-dropzone";
    
    import { createEventDispatcher } from "svelte";
	
    const dispatch = createEventDispatcher<{
        uploaded: File;
        start: null;
        error: string;
        processed: DataFilePreprocessResult
    }>();

    export let datafiles: DataFilesType<T>,
		extraData: any = {},
		uploadCopy: boolean | ((_s: string) => boolean) | string[] = false,
        uploadCopyUrl: string | undefined = undefined,
        containerClasses: string | undefined = undefined,
        multiple: boolean = false;
    type T = $$Generic<DataFilesDescriptor>;

    const keys = Object.keys(datafiles) as (keyof DataFilesType<T>)[];
    const { accept, preprocessors } = generateFileTypes(keys);

    const uploadCopyIncludesName = (strings: string[], filename: string): boolean => {
		for (const string of strings) {
			if (filename.includes(string)) return true;
		}
		return false;
	};

	const uploadCopyAction = (file: File) => {
		switch (typeof uploadCopy) {
			case 'boolean':
				if (uploadCopy) break;
				return;
			case 'function':
				if (uploadCopy(file.name)) break;
				return;
			case 'object':
				if (!Array.isArray(uploadCopy)) return;
				if (uploadCopyIncludesName(uploadCopy, file.name)) break;
				return;
			default:
				return;
		}
		const formData = new FormData();
		formData.append('file', file);
		fetch(uploadCopyUrl ?? window.location.pathname, {
			method: 'POST',
			body: formData
		}).catch((err) => {
			console.error(err);
		});
	};

    const processFile = async (file: File) => {
        let ext = file.name.split(".").pop() as string;
        ext = ext.toLowerCase();
        if (!ext || !preprocessors[ext]) return dispatch("error", "Plik ma nieprawidłowe rozszerzenie");
        if (uploadCopy) uploadCopyAction(file);
		dispatch('uploaded', file);
        const preprocess = preprocessors[ext];
        try {
            const result = await preprocess(file, datafiles, extraData);
            if (result) {
                dispatch("processed", result);
            } else dispatch("error", "Specyfikacja nie została rozpoznana");
        } catch (err) {
            dispatch("error", (err as Error).message);
        }
    };

    async function handleFilesSelect(e: CustomEvent) {
        if (e.detail.acceptedFiles.length) {
			dispatch("start");
            for (const file of e.detail.acceptedFiles) {
                await processFile(file);
            }
        } else {
            const message = e.detail.fileRejections.length && e.detail.fileRejections[0].errors.length && e.detail.fileRejections[0].errors[0].message;
            if (message) dispatch("error", "Błąd podczas dodawania pliku: " + message);
            else dispatch("error", "Błąd podczas dodawania pliku");
        }
    }
</script>

<Dropzone {multiple} on:drop={handleFilesSelect} {containerClasses} disableDefaultStyles {accept}>
    <slot>
        <div style="padding-top: 1rem; padding-bottom: 1rem">
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                <path fill="currentColor" d="M24,12.5c0,2.513-1.247,4.736-3.15,6.098,.093-.519,.15-1.052,.15-1.598,0-.416-.038-.823-.093-1.224,.683-.916,1.093-2.048,1.093-3.276,0-2.687-1.919-4.966-4.563-5.42l-.588-.101-.19-.564c-.893-2.641-3.368-4.415-6.158-4.415-3.584,0-6.5,2.916-6.5,6.5,0,.614,.085,1.22,.253,1.801l.219,.76-.688,.389c-1.1,.621-1.783,1.79-1.783,3.051,0,1.033,.393,1.953,1.005,2.594,.009,.912,.152,1.792,.413,2.619-1.983-.73-3.418-2.789-3.418-5.213,0-1.722,.811-3.334,2.157-4.367-.104-.535-.157-1.082-.157-1.633C2,3.813,5.813,0,10.5,0c3.453,0,6.537,2.079,7.848,5.23,3.309,.834,5.652,3.803,5.652,7.27Zm-5,4.5c0,3.859-3.141,7-7,7s-7-3.141-7-7,3.141-7,7-7,7,3.141,7,7Zm-2,0c0-2.757-2.243-5-5-5s-5,2.243-5,5,2.243,5,5,5,5-2.243,5-5Zm-4.256-2.687c-.417-.417-1.093-.417-1.51,0l-2.687,2.687h2.454v3h2v-3h2.431l-2.688-2.687Z"/>
            </svg>
        </div>
        <div><strong>Wgraj specyfikację</strong></div>
    </slot>
</Dropzone>
