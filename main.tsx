import * as React from 'react'
import {render} from 'react-dom'

import {useForm, withForm} from 'simple-form/lib/'
import * as t from 'simple-form/lib/types'
import * as F from 'simple-form/lib/components'


// Some branding types for validation
/////////////////////////////////////
interface Name { readonly Name: unique symbol }
const Name = t.brand(t.string, (s): s is t.Branded<string, Name> => s.length >= 4, 'Name')

interface Email { readonly Email: unique symbol }
const Email = t.brand(t.string, (s): s is t.Branded<string, Email> =>
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(s),
	'Email')

interface PosInt { readonly PosInt: unique symbol }
const PosInt = t.brand(t.number, (n): n is t.Branded<number, PosInt> => Number.isInteger(n) && n >= 0, 'PosInt')

interface DateT { readonly Date: unique symbol }
const DateT = t.brand(t.string, (s): s is t.Branded<string, DateT> => !Number.isNaN(Date.parse(s)), 'Date')

interface DateFuture { readonly DateFuture: unique symbol }
const DateFuture = t.brand(t.string, (s): s is t.Branded<string, DateFuture> => Date.parse(s) > Date.now(), 'DateFuture')

// Form data model
//////////////////

/* We can define two types for each field.
 * The BASE type should accept any initial value for the form (for
 * example empty fields and older API results)
 * The STRICT type is used for validation
 *
 * In the example we use basic types for BASE and branding types for STRICT.
 * STRICT can be omitted.
 */
export const TProfile = t.formModel({
	name: { base: t.string, strict: Name },
	email: { base: t.string, strict: Email },
	password: { base: t.string, strict: Name },
	age: { base: t.number, strict: t.optional(PosInt) },
	range: { base: t.number, strict: t.optional(PosInt) },
	date: { base: DateT, strict: DateFuture },
	agree: { base: t.boolean, strict: t.trueType },
	vote: { base: t.string, strict: t.literal('1', '2', '3') },
	vote2: { base: t.string, strict: t.literal('A', 'B', 'C') },
	vote3: { base: t.number, strict: t.literal('1', '2', '3') },
	color: { base: t.string }
})

/* The formModel helper provides two io-ts types for the model
 */
type TProfileBase = t.TypeOf<typeof TProfile.base>
type TProfileStrict = t.TypeOf<typeof TProfile.strict>

/* These are just some values for demonstration.
 */
const initialFormValues = {
	name: 'XY',
	email: 'email@example.com'
}


/* We import the form components from the example library and run them through
 * the withForm HOC.
 * This is a bit much boilerplate, but it provides good type checking.
 *
 * syntax: withState< ValueType, PropType, FormModelType >
 *
 * Some components support multiple value types.
 */
const TextInput = withForm<string, F.TextInputProps, TProfileStrict>(F.TextInput)
const NumberInput = withForm<number, F.NumberInputProps, TProfileStrict>(F.NumberInput)
const DateInput = withForm<string, F.DateInputProps, TProfileStrict>(F.DateInput)
const CheckBox = withForm<boolean, F.CheckBoxProps, TProfileStrict>(F.CheckBox)
const Radio = withForm<string, F.RadioProps<string>, TProfileStrict>(F.Radio)
const NumberRadio = withForm<number, F.NumberRadioProps, TProfileStrict>(F.NumberRadio)
const Select = withForm<string, F.SelectProps<string>, TProfileStrict>(F.Select)
const NumberSelect = withForm<number, F.NumberSelectProps, TProfileStrict>(F.Select)
const ColorInput = withForm<string, F.ColorInputProps, TProfileStrict>(F.ColorInput)

// Form component
/////////////////
function ProfileForm() {
	/* The useForm() hook is the main element of the library, it encapsulates
	 * the form handling logic.
	 *
	 * syntax useForm< FormModelType > (FormModelRuntimeType, options)
	 */
	const form = useForm<TProfileStrict>(TProfile.strict, {formID: 'profile'})

	/* We could initialize the form immediately, but it's more interesting to emulate an async form loading with an Effect.
	 */
	React.useEffect(() => {
		setTimeout(() => {
			const res = TProfile.base.decode(initialFormValues)
			console.log('INIT', res)
			if (t.isRight(res)) form.set(res.right)
		}, 2000)
	}, [])

	/* This is our onSubmit handler, it's pretty empty.
	 */
	async function onSubmit() {
		console.log('SUBMIT', form.valid() ? form.get() : 'invalid')
		if (form.valid()) alert('Form submit\n---------------------\n\n'
			+ Object.entries(form.get()).map(entry => entry.join(': ')).join('\n'))
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
		<F.Form id='profile' onSubmit={onSubmit} onReset={form.reset} form={form}>
			<F.FieldSet disabled={!form.state} legend='Text inputs'>
				<TextInput name='name' label='Name' error='Please provide minimum 4 characters' form={form}/>
				<TextInput name='email' type='email' label='Email' error='Please provide a valid email address' form={form}/>
				<TextInput name='password' type='password' label='Password' error='Please provide minimum 4 characters' form={form}/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Numeric inputs'>
				<NumberInput name='age' label='Age' error='Please provide a positive integer' form={form}/>
				<NumberInput name='range' type='range' label='Range' error='X' min={0} max={100} step={1} form={form}/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Date inputs'>
				<DateInput name='date' label='Date' error='Please provide a future date' form={form} min={new Date().toISOString().substr(0, 10)}/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Radio buttons'>
				<Radio name='vote' radioValue='1' label='Option 1' form={form}/>
				<Radio name='vote' radioValue='2' label='Option 2' form={form}/>
				<Radio name='vote' radioValue='3' label='Option 3' form={form} error='Please choose'/>
			</F.FieldSet>
			<F.FieldSet disabled={!form.state} legend='Other inputs'>
				<Select name='vote2' label='Vote'
					options={[[undefined, 'Please select'], ['A', 'Option A'], ['B', 'Option B'], ['C', 'Option C']]}
					error='Please select one option'
					form={form}
				/>
				<NumberSelect name='vote3' label='Vote'
					options={[[undefined, 'Please select'], [1, 'Option 1'], [2, 'Option 2'], [3, 'Option 3']]}
					error='Please select one option'
					form={form}
				/>
				<ColorInput name='color' label='Color' form={form}/>
			</F.FieldSet>
			<CheckBox name='agree' label='I agree to any conditions :)' error='You must agree to our conditions' form={form}/>
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
