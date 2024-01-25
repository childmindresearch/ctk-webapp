<script lang="ts">
  export let error: Error
</script>

<div class="text-center text-error-500">
  <div><strong>Error: {error.message}</strong></div>
  <div>
    <strong>Contact a system administrator.</strong>
  </div>
</div>
