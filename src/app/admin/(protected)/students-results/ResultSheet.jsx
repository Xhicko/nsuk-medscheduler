"use client"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {User2, Send, Loader} from "lucide-react"
import {Input} from '@/components/ui/input'
import { Separator } from "@/components/ui/separator"
import { Controller } from "react-hook-form"


export default function ResultSheet({ 
   isOpen,
   onOpenChange,
   formData,
   title,
   saveLoading = false,
   sheetResultForm,
   onSubmitResults,
}) {
   if (!formData) return null

   const { control, handleSubmit, formState: { errors, isSubmitting }, register, clearErrors, trigger } = sheetResultForm


  const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const GENOTYPES = ["AA", "AS", "SS", "AC", "SC"]
  const STATUS_OPTIONS = ["Normal", "Low", "High"]
  const RESULT_OPTIONS = ["Negative", "Positive"]
  
  const onSubmit = (data) => {
    if (onSubmitResults) {
      onSubmitResults(data)
    }
  }

  const onError = (errors) => {
    console.log('Form validation errors:', errors)
  }


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className={cn("w-full sm:max-w-3xl rounded-none p-0 flex flex-col", "data-[state=open]:animate-in")} side="right">
        <div className="h-1 w-full" />
        <div className="sticky top-0  bg-white/90 backdrop-blur border-b">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-[#0077B6]/10 p-2 text-[#0077B6]">
                  <User2 className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-xl font-extrabold text-[#0077B6]">{title = "Medical Result Form"}</SheetTitle>
                  <SheetDescription className="text-gray-600">
                   Complete blood and screening results form for  <span className="font-medium text-[#0077B6]">{formData?.student_name || "this student"}</span>
                  </SheetDescription>
                </div>
              </div>
            </div>
          </SheetHeader>
        </div> 

   <form onSubmit={handleSubmit(onSubmit, onError)} className="flex-1 overflow-y-auto px-4">
            <div className="grid gap-4 mb-5">
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-[#0077B6]">Blood Group *</Label>
                   <Controller
                      name="bloodGroup"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Clear error and trigger validation when user selects
                            if (value) {
                              clearErrors('bloodGroup')
                              trigger('bloodGroup')
                            }
                          }}
                        >
                          <SelectTrigger className={cn("w-full", errors.bloodGroup && "border-red-500")}>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.bloodGroup && <p className="text-sm text-red-500">{errors.bloodGroup.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genotype" className="text-[#0077B6]">Genotype *</Label>
                    <Controller
                      name="genotype"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value)
                            // Clear error and trigger validation when user selects
                            if (value) {
                              clearErrors('genotype')
                              trigger('genotype')
                            }
                          }}
                        >
                          <SelectTrigger className={cn("w-full", errors.genotype && "border-red-500")}>
                            <SelectValue placeholder="Select genotype" />
                          </SelectTrigger>
                          <SelectContent>
                            {GENOTYPES.map((genotype) => (
                              <SelectItem key={genotype} value={genotype}>{genotype}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.genotype && <p className="text-sm text-red-500">{errors.genotype.message}</p>}
                  </div>
            </div>

             <Separator />
            <div className="grid gap-4 mb-5 mt-5">
                      <div className="space-y-2">
                           <Label htmlFor="hemoglobin" className="text-[#0077B6]">Hemoglobin (Blood Level) *</Label>
                           <div className="flex gap-2">
                              <Controller
                                 name="hemoglobinStatus"
                                 control={control}
                                 render={({ field }) => (
                                    <Select 
                                      value={field.value} 
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        // Clear errors and trigger validation for both status and value
                                        if (value) {
                                          clearErrors(['hemoglobinStatus', 'hemoglobinValue'])
                                          trigger(['hemoglobinStatus', 'hemoglobinValue'])
                                        }
                                      }}
                                    >
                                       <SelectTrigger className={cn("w-[70%]", errors.hemoglobinStatus && "border-red-500")}><SelectValue placeholder="Status" /></SelectTrigger>
                                       <SelectContent>
                                          {STATUS_OPTIONS.map((status) => (
                                             <SelectItem key={status} value={status}>{status}</SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 )}
                              />
                              <Input
                                 type="text"
                                 step="0.1"
                                 placeholder="g/dL"
                                 className={cn("w-[30%] h-14.5", errors.hemoglobinValue && "border-red-500")}
                                 {...register('hemoglobinValue', {
                                   onChange: (e) => {
                                     // Clear errors and trigger validation when user types
                                     if (e.target.value) {
                                       clearErrors(['hemoglobinStatus', 'hemoglobinValue'])
                                       trigger(['hemoglobinStatus', 'hemoglobinValue'])
                                     }
                                   }
                                 })}
                              />
                           </div>
                           {(errors.hemoglobinStatus || errors.hemoglobinValue) && (
                             <p className="text-sm text-red-500">
                               {errors.hemoglobinStatus?.message || errors.hemoglobinValue?.message}
                             </p>
                           )}
                        </div>

                      <div className="space-y-2">
                           <Label htmlFor="wbc" className="text-[#0077B6]">White Blood Cells (WBC) *</Label>
                           <div className="flex gap-2">
                              <Controller
                                 name="wbcStatus"
                                 control={control}
                                 render={({ field }) => (
                                    <Select 
                                      value={field.value} 
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        // Clear errors and trigger validation for both status and value
                                        if (value) {
                                          clearErrors(['wbcStatus', 'wbcValue'])
                                          trigger(['wbcStatus', 'wbcValue'])
                                        }
                                      }}
                                    >
                                       <SelectTrigger className={cn("w-[70%]", errors.wbcStatus && "border-red-500")}><SelectValue placeholder="Status" /></SelectTrigger>
                                       <SelectContent>
                                          {STATUS_OPTIONS.map((status) => (
                                             <SelectItem key={status} value={status}>{status}</SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 )}
                              />
                              <Input
                                 type="text"
                                 step="0.1"
                                 placeholder="×10⁹/L"
                                 className={cn("w-[30%] h-14.5", errors.wbcValue && "border-red-500")}
                                 {...register('wbcValue', {
                                   onChange: (e) => {
                                     // Clear errors and trigger validation when user types
                                     if (e.target.value) {
                                       clearErrors(['wbcStatus', 'wbcValue'])
                                       trigger(['wbcStatus', 'wbcValue'])
                                     }
                                   }
                                 })}
                              />
                           </div>
                           {(errors.wbcStatus || errors.wbcValue) && (
                             <p className="text-sm text-red-500">
                               {errors.wbcStatus?.message || errors.wbcValue?.message}
                             </p>
                           )}
                      </div>
            </div>
            
            <Separator />
            <div className="grid gap-4 mb-5 mt-5">
                      <div className="space-y-2">
                           <Label htmlFor="platelets" className="text-[#0077B6]">Platelets *</Label>
                           <div className="flex gap-2">
                              <Controller
                                 name="plateletsStatus"
                                 control={control}
                                 render={({ field }) => (
                                    <Select 
                                      value={field.value} 
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        // Clear errors and trigger validation for both status and value
                                        if (value) {
                                          clearErrors(['plateletsStatus', 'plateletsValue'])
                                          trigger(['plateletsStatus', 'plateletsValue'])
                                        }
                                      }}
                                    >
                                       <SelectTrigger className={cn("w-[70%]", errors.plateletsStatus && "border-red-500")}><SelectValue placeholder="Status" /></SelectTrigger>
                                       <SelectContent>
                                          {STATUS_OPTIONS.map((status) => (
                                             <SelectItem key={status} value={status}>{status}</SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 )}
                              />
                              <Input
                                 type="number"
                                 step="1"
                                 placeholder="×10⁹/L"
                                 className={cn("w-[30%] h-14.5", errors.plateletsValue && "border-red-500")}
                                 {...register('plateletsValue', {
                                   onChange: (e) => {
                                     // Clear errors and trigger validation when user types
                                     if (e.target.value) {
                                       clearErrors(['plateletsStatus', 'plateletsValue'])
                                       trigger(['plateletsStatus', 'plateletsValue'])
                                     }
                                   }
                                 })}
                              />
                           </div>
                           {(errors.plateletsStatus || errors.plateletsValue) && (
                             <p className="text-sm text-red-500">
                               {errors.plateletsStatus?.message || errors.plateletsValue?.message}
                             </p>
                           )}
                      </div>

                      <div className="space-y-2">
                           <Label htmlFor="randomBloodSugar" className="text-[#0077B6]">Random Blood Sugar *</Label>
                           <div className="flex gap-2">
                              <Controller
                                 name="bloodSugarStatus"
                                 control={control}
                                 render={({ field }) => (
                                    <Select 
                                      value={field.value} 
                                      onValueChange={(value) => {
                                        field.onChange(value)
                                        // Clear errors and trigger validation for both status and value
                                        if (value) {
                                          clearErrors(['bloodSugarStatus', 'bloodSugarValue'])
                                          trigger(['bloodSugarStatus', 'bloodSugarValue'])
                                        }
                                      }}
                                    >
                                       <SelectTrigger className={cn("w-[70%]", errors.bloodSugarStatus && "border-red-500")}><SelectValue placeholder="Status" /></SelectTrigger>
                                       <SelectContent>
                                          {STATUS_OPTIONS.map((status) => (
                                             <SelectItem key={status} value={status}>{status}</SelectItem>
                                          ))}
                                       </SelectContent>
                                    </Select>
                                 )}
                              />
                              <Input
                                 type="number"
                                 step="0.1"
                                 placeholder="mmol/L"
                                 className={cn("w-[30%] h-14.5", errors.bloodSugarValue && "border-red-500")}
                                 {...register('bloodSugarValue', {
                                   onChange: (e) => {
                                     // Clear errors and trigger validation when user types
                                     if (e.target.value) {
                                       clearErrors(['bloodSugarStatus', 'bloodSugarValue'])
                                       trigger(['bloodSugarStatus', 'bloodSugarValue'])
                                     }
                                   }
                                 })}
                              />
                           </div>
                           {(errors.bloodSugarStatus || errors.bloodSugarValue) && (
                             <p className="text-sm text-red-500">
                               {errors.bloodSugarStatus?.message || errors.bloodSugarValue?.message}
                             </p>
                           )}
                      </div>
            </div>
            <Separator />
            <div className="grid gap-4 mb-5 mt-5">
                      <div className="space-y-2">
                         <Label htmlFor="hiv" className="text-[#0077B6]">HIV *</Label>
                         <Controller
                            name="hivResult"
                            control={control}
                            render={({ field }) => (
                               <Select 
                                 value={field.value} 
                                 onValueChange={(value) => {
                                   field.onChange(value)
                                   // Clear error and trigger validation when user selects
                                   if (value) {
                                     clearErrors('hivResult')
                                     trigger('hivResult')
                                   }
                                 }}
                               >
                                  <SelectTrigger className={cn("w-full", errors.hivResult && "border-red-500")}><SelectValue placeholder="Select result" /></SelectTrigger>
                                  <SelectContent>
                                     {RESULT_OPTIONS.map((result) => (
                                        <SelectItem key={result} value={result}>{result}</SelectItem>
                                     ))}
                                  </SelectContent>
                               </Select>
                            )}
                         />
                         {errors.hivResult && <p className="text-sm text-red-500">{errors.hivResult.message}</p>}
                      </div>

                      <div className="space-y-2">
                         <Label htmlFor="hepatitisB" className="text-[#0077B6]">Hepatitis B *</Label>
                         <Controller
                            name="hepatitisBResult"
                            control={control}
                            render={({ field }) => (
                               <Select 
                                 value={field.value} 
                                 onValueChange={(value) => {
                                   field.onChange(value)
                                   // Clear error and trigger validation when user selects
                                   if (value) {
                                     clearErrors('hepatitisBResult')
                                     trigger('hepatitisBResult')
                                   }
                                 }}
                               >
                                  <SelectTrigger className={cn("w-full", errors.hepatitisBResult && "border-red-500")}><SelectValue placeholder="Select result" /></SelectTrigger>
                                  <SelectContent>
                                     {RESULT_OPTIONS.map((result) => (
                                        <SelectItem key={result} value={result}>{result}</SelectItem>
                                     ))}
                                  </SelectContent>
                               </Select>
                            )}
                         />
                         {errors.hepatitisBResult && <p className="text-sm text-red-500">{errors.hepatitisBResult.message}</p>}
                      </div>
            </div>

            <div className="grid gap-4">
                      <div className="space-y-2">
                         <Label htmlFor="hepatitisC" className="text-[#0077B6]">Hepatitis C *</Label>
                         <Controller
                            name="hepatitisCResult"
                            control={control}
                            render={({ field }) => (
                               <Select 
                                 value={field.value} 
                                 onValueChange={(value) => {
                                   field.onChange(value)
                                   // Clear error and trigger validation when user selects
                                   if (value) {
                                     clearErrors('hepatitisCResult')
                                     trigger('hepatitisCResult')
                                   }
                                 }}
                               >
                                  <SelectTrigger className={cn("w-full", errors.hepatitisCResult && "border-red-500")}><SelectValue placeholder="Select result" /></SelectTrigger>
                                  <SelectContent>
                                     {RESULT_OPTIONS.map((result) => (
                                        <SelectItem key={result} value={result}>{result}</SelectItem>
                                     ))}
                                  </SelectContent>
                               </Select>
                            )}
                         />
                         {errors.hepatitisCResult && <p className="text-sm text-red-500">{errors.hepatitisCResult.message}</p>}
                      </div>

            </div>

            <div className="flex justify-end mt-10">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || saveLoading}
                        className="w-full flex items-center justify-center gap-2 h-13 bg-[#0077B6] hover:bg-[#0077B6]/90 cursor-pointer text-white hover:text-white disabled:opacity-50"
                      >
                   {saveLoading || isSubmitting ? (
                       <>
                           <Loader className="h-4 w-4 animate-spin" />
                           {isSubmitting ? 'Validating...' : `Notifying ${formData?.student_name || "this student"}...`}
                       </>
                         ) : (
                       <>
                           <Send className="h-4 w-4" />
                           Notify {formData?.student_name || "this student"}
                       </>
                   )}
               </Button>
            </div>
        </form>

        <SheetFooter className="border-t bg-white px-6 py-3">
          <div className="flex w-full items-center justify-between gap-2">
            <div className="text-xs text-gray-500">Secure and confidential</div>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6]/10 hover:text-[#0077B6] cursor-pointer">
              Close
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
