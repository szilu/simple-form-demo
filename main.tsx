import * as React from 'react'
import { render } from 'react-dom'

import { useForm, withForm, t } from '@symbion/simple-form'
import typedInputs from '@symbion/simple-form/lib/components-withform'
import { V } from '@symbion/simple-form/lib/validator'

// Validator functions
//////////////////////
const isFutureDate: t.Validator<string> = async (value: string) => new Promise(resolve => setTimeout(() => resolve(typeof value == 'string' && Date.parse(value) > Date.now()), 1000))

// Form data model
//////////////////

/* We can define two IO-TS types for each field.
 * Validators further constrain the acceptable values
 */
export const profileModel = t.formModel({
	name: { type: t.string, valid: V.string().minLength(4) },
	email: { type: t.string, valid: V.string().email() },
	password: { type: t.string, valid: V.string().minLength(8) },
	age: { type: t.optional(t.number), valid: V.number() },
	range: { type: t.number, valid: V.number().positive().integer() },
	date: { type: t.optional(t.string), valid: isFutureDate },
	agree: { type: t.boolean, valid: V.boolean().true() },
	vote: { type: t.string, valid: V.string().in(['1', '2', '3']) },
	vote2: { type: t.string, valid: V.string().in(['A']) },
	vote3: { type: t.number, valid: V.number().in([2]) },
	color: { type: t.string }
})

/* The formModel helper provides two io-ts types for the model
 */
type TProfilePartial = t.TypeOf<typeof profileModel.base>
type TProfile = t.TypeOf<typeof profileModel.strict>

/* These are just some values for demonstration.
 */
const initialFormValues = {
	name: 'XY',
	email: 'email@example.com'
}

/* For strict type checking we have to create specific components that know
 * about our model type.
 */
const F = typedInputs<TProfile>()

// Form component
/////////////////
function ProfileForm() {
	/* The useForm() hook is the main element of the library, it encapsulates
	 * the form handling logic.
	 *
	 * syntax useForm< FormModelType > (FormModelRuntimeType, options)
	 */
	const form = useForm<TProfile>(profileModel, { formID: 'profile' })

	/* We could initialize the form immediately, but it's more interesting to emulate an async form loading with an Effect.
	 */
	React.useEffect(() => {
		setTimeout(() => {
			form.setStrict(initialFormValues)
		}, 2000)
	}, [])

	/* This is our onSubmit handler, it's pretty empty.
	 */
	async function onSubmit() {
		const valid = await form.valid()
		console.log('SUBMIT', valid ? form.get() : 'invalid')
		if (valid) {
			alert('Form submit\n---------------------\n\n'
				+ Object.entries(form.get()).map(entry => entry.join(': ')).join('\n'))
		}
	}

	/* If the form is not initialized yet, we don't show it
	 */
	if (!form.state) return <h2 className='text-center'>Loading...</h2>

	/* We render the form.
	 * The withForm() HOC injects most of the props into the components, we
	 * just provide the FORM object from the useForm() hook.
	 */
	return <div>
		<h1>Profile</h1>
		<F.Form onSubmit={onSubmit} onReset={form.reset} form={form}>
			<F.FieldSet disabled={!form.state} legend='Text inputs'>
				<F.TextInput name='name' label='Name' error='Please provide minimum 4 characters' form={form}/>
				<F.TextInput name='email' type='email' label='Email' error='Please provide a valid email address' form={form}/>
				<F.TextInput name='password' type='password' label='Password' error='Please provide minimum 8 characters' form={form}/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Numeric inputs'>
				<F.NumberInput name='age' label='Age' error='Please provide a positive integer' form={form}/>
				<F.NumberInput name='range' type='range' label='Range' error='X' min={0} max={100} step={1} form={form}/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Date inputs'>
				<F.DateInput name='date' label='Date' error='Please provide a future date' form={form} min={new Date().toISOString().substr(0, 10)}/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Radio buttons'>
				<F.Radio name='vote' radioValue='1' label='Option 1' form={form}/>
				<F.Radio name='vote' radioValue='2' label='Option 2' form={form}/>
				<F.Radio name='vote' radioValue='3' label='Option 3' form={form} error='Please choose'/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Other inputs'>
				<F.Select name='vote2' label='Vote'
					options={[[undefined, 'Please select'], ['A', 'Option A'], ['B', 'Option B'], ['C', 'Option C']]}
					error='Please select option A'
					form={form}
				/>
				<F.NumberSelect name='vote3' label='Vote'
					options={[[undefined, 'Please select'], [1, 'Option 1'], [2, 'Option 2'], [3, 'Option 3']]}
					error='Please select option 2'
					form={form}
				/>
				<F.ColorInput name='color' label='Color' form={form}/>
			</F.FieldSet>
			<F.CheckBox name='agree' label='I agree to any conditions :)' error='You must agree to our conditions' form={form}/>
			<F.Button type='submit' className='btn-primary'>Submit</F.Button>
			<F.Button type='reset' className='btn-secondary'>Reset</F.Button>
		</F.Form>
	</div>
}

/* Finally we render the page
 *
 * That's it
 */
const appElement = document.getElementById('app')
if (appElement) render(<div className='container'><ProfileForm/></div>, appElement)

// vim: ts=4
