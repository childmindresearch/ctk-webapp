<script lang="ts">
import { Button } from "$lib/shadcn/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "$lib/shadcn/components/ui/card"
import { Checkbox } from "$lib/shadcn/components/ui/checkbox"
import { Label } from "$lib/shadcn/components/ui/label"
import { Textarea } from "$lib/shadcn/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "$lib/shadcn/components/ui/radio-group"
import { Separator } from "$lib/shadcn/components/ui/separator"
import { toast } from "svelte-sonner"
import { Spinner } from "$lib/shadcn/components/ui/spinner"

let isLoading = $state(false)
let formData = $state({
  // 1. Appearance
  appearance: {
    casualDress: false,
    poorHygiene: false,
    llComments: "",
    cogComments: ""
  },
  // 2. Eye Contact
  eyeContact: "",
  eyeContactLLComments: "",
  eyeContactCogComments: "",
  
})

async function onSubmit() {
  isLoading = true
  
  // Simulate API call
  setTimeout(() => {
    console.log("Form data:", formData)
    toast.success("Mental Health & Behavior section saved successfully!")
    isLoading = false
  }, 1500)
}

function resetForm() {
  formData = {
    appearance: {
      casualDress: false,
      poorHygiene: false,
      llComments: "",
      cogComments: ""
    },
    eyeContact: "",
    eyeContactLLComments: "",
    eyeContactCogComments: "", }
  toast.info("Form reset")
}
</script>

<div class="container mx-auto max-w-4xl p-6">
  <div class="mb-8">
    <h3 class="text-3xl font-semibold tracking-tight mb-4">Behavioral Observation Checklist</h3>
    <p class="text-muted-foreground leading-relaxed">
      Please check items that apply and if applicable use the fields to further describe behavior.
    </p>
  </div>

      <!-- Mental Health & Behavior Section -->
        <Card>
            <CardHeader>
                <CardTitle>Mental Health & Behavior</CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
            {#if isLoading}
                <div class="flex flex-col items-center space-y-4 py-12">
                    <Spinner />
                    <p class="text-muted-foreground">Saving checklist...</p>
                </div>
            {:else}
            <form onsubmit={onSubmit} class="space-y-6">
            
            <!-- 1. Appearance -->
                <div class="space-y-3">
                    <Label class="text-base font-semibold">1. Appearance</Label>
                    <div class="space-y-2 ml-4">
                        <div class="flex items-center space-x-2">
                            <Checkbox id="appearance-casual" bind:checked={formData.appearance.casualDress} />
                            <Label for="appearance-casual" class="font-normal">
                                Casual dress, normal grooming and hygiene
                            </Label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <Checkbox id="appearance-poor" bind:checked={formData.appearance.poorHygiene} />
                            <Label for="appearance-poor" class="font-normal">
                                Poor hygiene and/or grooming
                            </Label>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <Label for="appearance-ll">L&L Additional comments:</Label>
                            <Textarea 
                                id="appearance-ll" 
                                bind:value={formData.appearance.llComments}
                                placeholder="Enter additional comments..."
                            />
                    </div>
                    <div class="space-y-2">
                        <Label for="appearance-cog">Cog Additional comments:</Label>
                        <Textarea 
                            id="appearance-cog" 
                            bind:value={formData.appearance.cogComments}
                            placeholder="Enter additional comments..."
                        />
                    </div>
                </div>

            <Separator />
            <!-- 2. Eye Contact -->
            <div class="space-y-3">
                <Label class="text-base font-semibold">2. Eye Contact</Label>
                <RadioGroup bind:value={formData.eyeContact}>
                <div class="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="eye-good" />
                    <Label for="eye-good" class="font-normal">Good</Label>
                </div>
                <div class="flex items-center space-x-2">
                    <RadioGroupItem value="fair" id="eye-fair" />
                    <Label for="eye-fair" class="font-normal">Fair</Label>
                </div>
                <div class="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="eye-poor" />
                    <Label for="eye-poor" class="font-normal">Poor</Label>
                </div>
                <div class="flex items-center space-x-2">
                    <RadioGroupItem value="inconsistent" id="eye-inconsistent" />
                    <Label for="eye-inconsistent" class="font-normal">Inconsistent</Label>
                </div>
                <div class="flex items-center space-x-2">
                    <RadioGroupItem value="fleeting" id="eye-fleeting" />
                    <Label for="eye-fleeting" class="font-normal">Fleeting</Label>
                </div>
                </RadioGroup>
                <div class="space-y-2">
                <Label for="eyecontact-ll">L&L Additional comments:</Label>
                <Textarea 
                    id="eyecontact-ll" 
                    bind:value={formData.eyeContactLLComments}
                    placeholder="Enter additional comments..."
                />
                </div>
                <div class="space-y-2">
                <Label for="eyecontact-cog">Cog Additional comments:</Label>
                <Textarea 
                    id="eyecontact-cog" 
                    bind:value={formData.eyeContactCogComments}
                    placeholder="Enter additional comments..."
                />
                </div>
                  <!-- Action Buttons -->
                <div class="flex justify-between pt-4">
                    <Button type="button" variant="outline" onclick={resetForm}>
                    Reset Form
                    </Button>
                    <Button type="submit" class="min-w-32">
                    Save Section
                    </Button>
                </div>
            </div>

            </form>
            {/if}
        </CardContent>
        </Card>


</div>