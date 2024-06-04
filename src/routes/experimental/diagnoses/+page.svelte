<script lang="ts">
    import { PUBLIC_COLLABORA_URL, PUBLIC_WOPI_URL } from "$lib/publicEnv"

    const wopisrc = PUBLIC_WOPI_URL + "/wopi/files/test3.docx"
    const encodedWopisrc = encodeURIComponent(wopisrc)

    const src = PUBLIC_COLLABORA_URL + `/browser/80a6f97/cool.html?WOPISrc=${encodedWopisrc}`
</script>

<iframe title={"Editor"} {src} width="90%" height="1200px"></iframe>
