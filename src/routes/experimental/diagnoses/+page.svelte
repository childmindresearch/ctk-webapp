<script lang="ts">
    const wopisrc: string = "http://localhost:3000/api/experimental/wopi/files/test3.docx?access_token=fake"
    const encodedWopisrc: string = encodeURIComponent(wopisrc)
</script>

<iframe
    title={"Editor"}
    src={`http://localhost:9980/browser/80a6f97/cool.html?WOPISrc=${encodedWopisrc}`}
    width="90%"
    height="1200px"
></iframe>
