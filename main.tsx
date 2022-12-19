import * as React from 'react'
import { createRoot } from 'react-dom/client'

import * as T from '@symbion/runtype'
import { useForm, useFormSchema } from '@symbion/simple-form'
import typedInputs from '@symbion/simple-form/esm/components-withform'

// Validator functions
//////////////////////
function isFutureDate(v: string | undefined) {
	return new Promise<T.Result<string | undefined, T.RTError>>(resolve => setTimeout(() => resolve(typeof v == 'string' && Date.parse(v) && Date.parse(v) > Date.now() ? T.ok(v) : T.error("Can't be in the past")), 1000))
}

// Form data model
//////////////////
const tProfile = T.struct({
	name: T.string.minLength(3),
	email: T.string.email(),
	password: T.string.minLength(8),
	age: T.optional(T.number),
	range: T.number.min(0).integer(),
	date: T.optional(T.string).addValidator(isFutureDate),
	agree: T.boolean.true(),
	vote: T.string.in('1', '2', '3'),
	vote2: T.string.in('A'),
	vote3: T.number.in(2),
	color: T.string
})
type TProfile = T.TypeOf<typeof tProfile>

const initialFormValues = {
	name: 'XY',
	email: 'email@example.com',
	zizi: 'zizi'
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
	const form = useForm(tProfile, { formID: 'profile' })

	/* We could initialize the form immediately, but it's more interesting to emulate an async form loading with an Effect.
	 */
	React.useEffect(() => {
		setTimeout(() => {
			form.setStrict(initialFormValues, { unknownFields: 'discard'})
		}, 1000)
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
	if (!form.state) return <h2 className="text-center">Loading...</h2>

	/* We render the form.
	 * The withForm() HOC injects most of the props into the components, we
	 * just provide the FORM object from the useForm() hook.
	 */
	return <div className="container mt-4">
		<h1>Profile</h1>
		<F.Form onSubmit={onSubmit} onReset={form.reset} form={form}>
			<div className="row">
				<div className="col-sm">
					<F.FieldSet disabled={!form.state} legend="Text inputs">
						{/*
						<F.TextInput name="name" label="Name" error="Please provide minimum 4 characters" form={form}/>
						*/}
						<label className="form-group d-block">Name
							<input className={'form-control' + (form.errors.name ? ' is-invalid' : form.errors.name == false ? ' is-valid' : '')} type="text" {...form.props('name')}/>
							{form.errors.name && <div className="invalid-feedback">Please provide minimum 4 characters</div>}
						</label>
						<F.TextInput name="email" type="email" label="Email" error="Please provide a valid email address"/>
						<F.TextInput name="password" type="password" label="Password" error="Please provide minimum 8 characters"/>
					</F.FieldSet>
					<F.FieldSet disabled={!form.state} legend="Numeric inputs">
						<F.NumberInput name="age" label="Age" error="Please provide a positive integer"/>
						<F.NumberInput name="range" type="range" label="Range" error="X" min={0} max={100} step={1}/>
					</F.FieldSet>
				</div>
				<div className="col-sm">
					<F.FieldSet disabled={!form.state} legend="Date input">
						<F.DateInput name="date" label="Date" error="Please provide a future date" min={new Date().toISOString().substr(0, 10)}/>
					</F.FieldSet>
					<F.FieldSet disabled={!form.state} legend="Radio buttons">
						<F.Radio name="vote" radioValue="1" label="Option 1" form={form}/>
						<F.Radio name="vote" radioValue="2" label="Option 2" form={form}/>
						<F.Radio name="vote" radioValue="3" label="Option 3" form={form} error="Please choose"/>
					</F.FieldSet>
					<F.FieldSet disabled={!form.state} legend="Other inputs">
						<F.Select name="vote2" label="Vote"
							options={[[undefined, 'Please select'], ['A', 'Option A'], ['B', 'Option B'], ['C', 'Option C']]}
							error="Please select option A"
							form={form}
						/>
						<F.NumberSelect name="vote3" label="Vote"
							options={[[undefined, 'Please select'], [1, 'Option 1'], [2, 'Option 2'], [3, 'Option 3']]}
							error="Please select option 2"
							form={form}
						/>
						<F.ColorInput name="color" label="Color" form={form}/>
					</F.FieldSet>
				</div>
			</div>
			<F.CheckBox name="agree" label="I agree to any conditions :)" error="You must agree to our conditions" form={form}/>
			<F.Button type="submit" className="btn-primary">Submit</F.Button>
			<F.Button type="reset" className="btn-secondary ml-2">Reset</F.Button>
		</F.Form>
	</div>
}

/* Finally we render the page
 *
 * That's it
 */
const root = createRoot(document.getElementById('app')!)
root.render(<div className='container'><ProfileForm/></div>)

// vim: ts=4
