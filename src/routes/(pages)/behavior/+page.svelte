<script lang="ts">
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Card, CardContent, CardHeader, CardTitle } from "$lib/shadcn/components/ui/card"
    import { Checkbox } from "$lib/shadcn/components/ui/checkbox"
    import { Label } from "$lib/shadcn/components/ui/label"
    import { Textarea } from "$lib/shadcn/components/ui/textarea"
    import { RadioGroup, RadioGroupItem } from "$lib/shadcn/components/ui/radio-group"
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/shadcn/components/ui/tabs"
    import { Separator } from "$lib/shadcn/components/ui/separator"
    import { toast } from "svelte-sonner"
    import { Spinner } from "$lib/shadcn/components/ui/spinner"

    let isLoading = $state(false)
    let submittedFormData = $state({
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
        // 3. Hyperactivity (from Behavior Regulation section [1])
        hyperactivity: {
            fidgets: false,
            troubleQuietly: false,
            getsOutOfChair: false,
            runsAround: false,
            troubleWaiting: false,
            interrupts: false,
            talksTooMuch: false,
            blurtsAnswers: false,
            impulsivelyResponds: "",
            other: "",
            llComments: "",
            cogComments: ""
        },
        // 4. Support [1]
        support: {
            checklist: false,
            breaks: false,
            breakCount: "",
            redirections: false,
            encouragement: false,
            fidgets: false,
            other: "",
            respondedWell: "",
            llComments: "",
            cogComments: ""
        }
    })

    async function onSubmit() {
        isLoading = true

        // Simulate API call
        setTimeout(() => {
            console.log("Form data:", submittedFormData)
            toast.success("Mental Health & Behavior section saved successfully!")
            isLoading = false
        }, 1500)
    }

    function resetForm() {
        submittedFormData = {
            appearance: {
                casualDress: false,
                poorHygiene: false,
                llComments: "",
                cogComments: ""
            },
            eyeContact: "",
            eyeContactLLComments: "",
            eyeContactCogComments: "",
            hyperactivity: {
                fidgets: false,
                troubleQuietly: false,
                getsOutOfChair: false,
                runsAround: false,
                troubleWaiting: false,
                interrupts: false,
                talksTooMuch: false,
                blurtsAnswers: false,
                impulsivelyResponds: "",
                other: "",
                llComments: "",
                cogComments: ""
            },
            support: {
                checklist: false,
                breaks: false,
                breakCount: "",
                redirections: false,
                encouragement: false,
                fidgets: false,
                other: "",
                respondedWell: "",
                llComments: "",
                cogComments: ""
            }
        }
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

    <Tabs value="mental-health" class="w-full">
        <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="mental-health">Mental Health & Behavior</TabsTrigger>
            <TabsTrigger value="behavior-regulation">Behavior Regulation & Support</TabsTrigger>
        </TabsList>

        <!-- Tab 1: Mental Health & Behavior -->
        <TabsContent value="mental-health">
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
                                        <Checkbox
                                            id="appearance-casual"
                                            bind:checked={submittedFormData.appearance.casualDress}
                                        />
                                        <Label for="appearance-casual" class="font-normal">
                                            Casual dress, normal grooming and hygiene
                                        </Label>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="appearance-poor"
                                            bind:checked={submittedFormData.appearance.poorHygiene}
                                        />
                                        <Label for="appearance-poor" class="font-normal"
                                            >Poor hygiene and/or grooming</Label
                                        >
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <Label for="appearance-ll">L&L Additional comments:</Label>
                                    <Textarea
                                        id="appearance-ll"
                                        bind:value={submittedFormData.appearance.llComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="appearance-cog">Cog Additional comments:</Label>
                                    <Textarea
                                        id="appearance-cog"
                                        bind:value={submittedFormData.appearance.cogComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                            </div>

                            <Separator />
                            <!-- 2. Eye Contact -->
                            <div class="space-y-3">
                                <Label class="text-base font-semibold">2. Eye Contact</Label>
                                <RadioGroup bind:value={submittedFormData.eyeContact}>
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
                                        bind:value={submittedFormData.eyeContactLLComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="eyecontact-cog">Cog Additional comments:</Label>
                                    <Textarea
                                        id="eyecontact-cog"
                                        bind:value={submittedFormData.eyeContactCogComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                                <!-- Action Buttons -->
                                <div class="flex justify-between pt-4">
                                    <Button type="button" variant="outline" onclick={resetForm}>Reset Form</Button>
                                    <Button type="submit" class="min-w-32">Save Section</Button>
                                </div>
                            </div>
                        </form>
                    {/if}
                </CardContent>
            </Card>
        </TabsContent>
        <!-- Tab 2: Behavior Regulation & Support -->
        <TabsContent value="behavior-regulation">
            <Card>
                <CardHeader>
                    <CardTitle>Behavior Regulation & Support</CardTitle>
                </CardHeader>
                <CardContent class="space-y-6">
                    {#if isLoading}
                        <div class="flex flex-col items-center space-y-4 py-12">
                            <Spinner />
                            <p class="text-muted-foreground">Saving checklist...</p>
                        </div>
                    {:else}
                        <form onsubmit={onSubmit} class="space-y-6">
                            <!-- 1. Hyperactivity [1] -->
                            <div class="space-y-3">
                                <Label class="text-base font-semibold">1. Hyperactivity & Impulsivity</Label>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="hyper-fidgets"
                                            bind:checked={submittedFormData.hyperactivity.fidgets}
                                        />
                                        <Label for="hyper-fidgets" class="font-normal">Fidgets and squirms</Label>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="hyper-quietly"
                                            bind:checked={submittedFormData.hyperactivity.troubleQuietly}
                                        />
                                        <Label for="hyper-quietly" class="font-normal"
                                            >Has trouble working quietly</Label
                                        >
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="hyper-chair"
                                            bind:checked={submittedFormData.hyperactivity.getsOutOfChair}
                                        />
                                        <Label for="hyper-chair" class="font-normal"
                                            >Gets out of chair when not supposed to</Label
                                        >
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="hyper-runs"
                                            bind:checked={submittedFormData.hyperactivity.runsAround}
                                        />
                                        <Label for="hyper-runs" class="font-normal"
                                            >Runs around or climbs constantly</Label
                                        >
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="hyper-waiting"
                                            bind:checked={submittedFormData.hyperactivity.troubleWaiting}
                                        />
                                        <Label for="hyper-waiting" class="font-normal">Has trouble waiting turn</Label>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="hyper-interrupts"
                                            bind:checked={submittedFormData.hyperactivity.interrupts}
                                        />
                                        <Label for="hyper-interrupts" class="font-normal"
                                            >Interrupts others when they're speaking</Label
                                        >
                                    </div>
                                    <div class="flex items-center space-x-2 md:col-span-2">
                                        <Checkbox
                                            id="hyper-talks"
                                            bind:checked={submittedFormData.hyperactivity.talksTooMuch}
                                        />
                                        <Label for="hyper-talks" class="font-normal"
                                            >Talks too much during and between tasks</Label
                                        >
                                    </div>
                                    <div class="flex items-center space-x-2 md:col-span-2">
                                        <Checkbox
                                            id="hyper-blurts"
                                            bind:checked={submittedFormData.hyperactivity.blurtsAnswers}
                                        />
                                        <Label for="hyper-blurts" class="font-normal"
                                            >Blurts out answers before questions have been completed</Label
                                        >
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <Label>Impulsively responds to items:</Label>
                                    <RadioGroup bind:value={submittedFormData.hyperactivity.impulsivelyResponds}>
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="often" id="impulsive-often" />
                                            <Label for="impulsive-often" class="font-normal">Often</Label>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="occasionally" id="impulsive-occasionally" />
                                            <Label for="impulsive-occasionally" class="font-normal">Occasionally</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div class="space-y-2">
                                    <Label for="hyper-other">Other (describe):</Label>
                                    <Textarea
                                        id="hyper-other"
                                        bind:value={submittedFormData.hyperactivity.other}
                                        placeholder="Describe other behaviors..."
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="hyper-ll">L&L Additional comments:</Label>
                                    <Textarea
                                        id="hyper-ll"
                                        bind:value={submittedFormData.hyperactivity.llComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="hyper-cog">Cog Additional comments:</Label>
                                    <Textarea
                                        id="hyper-cog"
                                        bind:value={submittedFormData.hyperactivity.cogComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                            </div>

                            <Separator />

                            <!-- 2. Support [1] -->
                            <div class="space-y-3">
                                <Label class="text-base font-semibold">2. Support</Label>
                                <p class="text-sm text-muted-foreground ml-4">
                                    Check off which supports were provided:
                                </p>
                                <div class="space-y-2 ml-4">
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="support-checklist"
                                            bind:checked={submittedFormData.support.checklist}
                                        />
                                        <Label for="support-checklist" class="font-normal">Checklist</Label>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox id="support-breaks" bind:checked={submittedFormData.support.breaks} />
                                        <Label for="support-breaks" class="font-normal">Breaks</Label>
                                    </div>
                                    {#if submittedFormData.support.breaks}
                                        <div class="ml-6">
                                            <Label for="support-break-count">Number of breaks:</Label>
                                            <input
                                                type="number"
                                                id="support-break-count"
                                                bind:value={submittedFormData.support.breakCount}
                                                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                                                placeholder="Enter number"
                                            />
                                        </div>
                                    {/if}
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="support-redirections"
                                            bind:checked={submittedFormData.support.redirections}
                                        />
                                        <Label for="support-redirections" class="font-normal">Redirections</Label>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="support-encouragement"
                                            bind:checked={submittedFormData.support.encouragement}
                                        />
                                        <Label for="support-encouragement" class="font-normal">Encouragement</Label>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <Checkbox
                                            id="support-fidgets"
                                            bind:checked={submittedFormData.support.fidgets}
                                        />
                                        <Label for="support-fidgets" class="font-normal">Fidgets</Label>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <Label for="support-other">Other:</Label>
                                    <Textarea
                                        id="support-other"
                                        bind:value={submittedFormData.support.other}
                                        placeholder="Describe other supports..."
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label>Responded well to added support:</Label>
                                    <RadioGroup bind:value={submittedFormData.support.respondedWell}>
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="responded-yes" />
                                            <Label for="responded-yes" class="font-normal">Yes</Label>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="responded-no" />
                                            <Label for="responded-no" class="font-normal">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div class="space-y-2">
                                    <Label for="support-ll">L&L Additional comments:</Label>
                                    <Textarea
                                        id="support-ll"
                                        bind:value={submittedFormData.support.llComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                                <div class="space-y-2">
                                    <Label for="support-cog">Cog Additional comments:</Label>
                                    <Textarea
                                        id="support-cog"
                                        bind:value={submittedFormData.support.cogComments}
                                        placeholder="Enter additional comments..."
                                    />
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex justify-between pt-4">
                                <Button type="button" variant="outline" onclick={resetForm}>Reset Form</Button>
                                <Button type="submit" class="min-w-32">Save Section</Button>
                            </div>
                        </form>
                    {/if}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
</div>
