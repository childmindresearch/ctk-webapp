<script lang="ts">
    const wopisrc: string =
        "https://ctk-functions-python.jollybeach-29614a80.eastus.azurecontainerapps.io/api/experimental/wopi/files/test3.docx?access_token=fake"
    const encodedWopisrc: string = encodeURIComponent(wopisrc)
</script>

<iframe
    title={"Editor"}
    src={`https://libreoffice.jollybeach-29614a80.eastus.azurecontainerapps.io/browser/80a6f97/cool.html?WOPISrc=${encodedWopisrc}`}
    width="90%"
    height="1200px"
></iframe>
