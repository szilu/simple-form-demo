import * as React from 'react'
import {render} from 'react-dom'

import {useForm, withForm} from 'simple-form/lib/'
import * as t from 'simple-form/lib/types'
import * as F from 'simple-form/lib/components'


interface Name { readonly Name: unique symbol }
const Name = t.brand(t.string, (s): s is t.Branded<string, Name> => s.length >= 4, 'Name')

interface PosInt { readonly PosInt: unique symbol }
const PosInt = t.brand(t.number, (n): n is t.Branded<number, PosInt> => Number.isInteger(n) && n >= 0, 'PosInt')

interface DateT { readonly Date: unique symbol }
const DateT = t.brand(t.string, (s): s is t.Branded<string, DateT> => !Number.isNaN(Date.parse(s)), 'Date')

interface DateFuture { readonly DateFuture: unique symbol }
const DateFuture = t.brand(t.string, (s): s is t.Branded<string, DateFuture> => Date.parse(s) > Date.now(), 'DateFuture')

export const TProfile = t.twoLevelType({
    name: { base: t.string, strict: Name },
	age: { base: t.number, strict: PosInt },
	date: { base: DateT, strict: DateFuture }
})

type TProfileBase = t.TypeOf<typeof TProfile.base>
type TProfileStrict = t.TypeOf<typeof TProfile.strict>




const Input = withForm<string, F.InputPropsExt<string>, TProfileStrict>(F.Input)
const NumberInput = withForm<number, F.InputPropsExt<number>, TProfileStrict>(F.NumberInput)
const DateInput = withForm<string, F.DateProps, TProfileStrict>(F.DateInput)

function ProfileForm() {
	const form = useForm<TProfileStrict>(TProfile.strict, {formID: 'profile'})
	//const form = useForm<TProf>(TProf, {formID: 'profile'})

	React.useEffect(() => {
		// Emulate form loading
		setTimeout(() => {
			const res = TProfile.base.decode({ name: 'XY' })
			//const res = TProf.decode({ name: 'XY' })
			console.log('INIT', res)
			if (t.isRight(res)) form.set(res.right)
		}, 2000)
	}, [])

	async function onSubmit() {
		console.log('SUBMIT', form.valid() ? form.get() : 'invalid')
	}

	if (!form.state) return <h1 className='text-center'>Loading...</h1>

	return <div>
		<h1>Profile</h1>
		<F.Form onSubmit={onSubmit}>
			<Input name='name' label='Name' error='Minimum 4 letters' form={form}/>
			<NumberInput name='age' label='Age' error='Positive integer' form={form}/>
			<DateInput name='date' type='date' label='Date' error='Date must be in the future' form={form} min={new Date().toISOString().substr(0, 10)}/>
			<F.Submit>Submit</F.Submit>
		</F.Form>
	</div>
}


const appElement = document.getElementById('app')
if (appElement) render(<div className='container'><ProfileForm/></div>, appElement)

// vim: ts=4
