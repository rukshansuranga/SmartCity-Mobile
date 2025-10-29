generate payments related screens

i want to design payment screen

this is expo app
selected resident id can get
const { userInfo } = useAuthStore();
userinfo?.sub

im thinking 3 component inside the screen

1. show arears by landparcel and selected resident
   idea is to add tax cart for the payment so i like to add checkboxes for that
   i think it is better to add checkbox for landparcel level if it checked automatically select all taxable units
   but you can check
   under landparcel (address,need checkbox)
   taxableunit, reference, outstanding(sum), checkbox

show total arrears also

2. Current quater and future quarter by landparcel andn resident id
   this also users can be add total amount for the year for landparcel or chose quarter by quarter
   there should be business rule users must add quarters by order (q1, q2, q3) ok but (q2,q3) cant check
   landparcel(address, checkbox)
   taxableunitid, reference, quartername, discountamount (if discount applicable), quaterlytaxamount, checkbox

show total amount also

3. payment screen
   show total arears surchared
   show total arears amount
   show total for current quarter and future discount for quarter
   show total current quater and future

i want to integrate stripe payment integration (dont integrate stripe just create dumy layout for that next step is that integration)
think abount that integration layout

you have 2 fetch method in taxaction

export async function getQuarterlyTaxByResidentId(
residentId: string
): Promise<ApiResponse<QuarterlyTaxByResidentDto[]>> {
return fetchWrapper.get(`tax/quarterly-tax/${residentId}`);
}

export async function getArrearsByResidentId(
residentId: string
): Promise<ApiResponse<Arrears[]>> {
return fetchWrapper.get(`tax/arrears/resident/${residentId}`);
}

i like add 2 switch button for (arears, current, payment)
i like tab layout
what do you think for this

use payment.tsx screen for that under (tax)

you need to create zustand state for this payment management, create it under stores

do you have any clarification ask me
