/* eslint-disable react/react-in-jsx-scope */
/** 
  * To-do
  * 
  * [x] Validação / Transformação
  * [x] Field Arrays
  * [x] Upload de arquivos 
  * [] Composittion Pattern 
*/

// REACT HOOK FORM; ZOD ; @HOOKFORM
import { useForm, FieldArray, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// HOOKS
import { useState } from 'react'

// SUPARBASE
import { supabase } from '../lib/superbase'

//TAILWINDCSS
import './styles/global.css'

const createUserFormSchema = z.object({
  avatar: z.instanceof(FileList)
    .transform(list => list.item(0)!)
    .refine(file => file!.size <= 5 * 1024 * 1024, 'O arquivo precisa ter no maximo 5mb'),
  name: z.string()
    .nonempty('Nome do usuário é obrigatorio')
    .transform(name => {
      return name.trim().split(' ').map(word => {
        return word[0].toLocaleUpperCase().concat(word.substring(1))
      }).join(' ')
    }),
  email: z.string()
    .nonempty('O e-mail é obrigatorio')
    .email('Formato do e-mail inválido')
    .toLowerCase()
    .refine(email => {
      return email.endsWith('gmail.com')
    }, "O email deve terminar com 'gmail.com' para ser validado" ),
  password: z.string()
    .nonempty('Senha é obrigatoria')
    .min(6,'A senha precisa de no minimo 6 caracteres'),
  techs: z.array(z.object({
    title: z.string().nonempty('O titulo é obrigatório'),
    knowledge: z.coerce.number().min(1).max(100)
  }))
    .min(2, 'Insira pelo menos 2 techs')
    // .refine(techs => {
    //   return techs.some(tech => tech.knowledge > 50)
    // }, 'Você está aprendendo')
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>


function App() {
  const [output, setOutput]  = useState('')
  
  const { 
    register,
    handleSubmit,
    formState : { errors }, control } = useForm<CreateUserFormData>({
    resolver:zodResolver(createUserFormSchema)
  })

  const { fields, append } = useFieldArray({
    control,
    name:'techs',
  })

  async function createUser ( data: CreateUserFormData ){
    await supabase.storage.from('forms-react').upload(data.avatar.name, 
      data.avatar
    )

    setOutput(JSON.stringify(data, null, 2))
  }

  const addNewTech = () => {
    append({title: ' ', knowledge:0})
  }

  return (
     <main className='min-h-screen bg-zinc-950 text-zinc-300 flex flex-col gap-10 items-center justify-center'>
      <form
        onSubmit={handleSubmit(createUser)} 
        className='flex flex-col gap-4 w-full max-w-xs'>
        
        <div className='flex flex-col gap-1 px-3'>
          <label htmlFor="avatar">Avatar</label>
          <input 
            type="file"  
            accept='image/*'
            {...register('avatar')}
            />
            {errors.avatar && <span className='text-red-500 text-sm'>{errors.avatar.message}</span>}
        </div>


        <div className='flex flex-col gap-1 px-3'>
          <label htmlFor="name">Nome</label>
          <input 
            type="text"  
            className='boder border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            {...register('name')}
            />
            {errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>}
        </div>


        <div className='flex flex-col gap-1 px-3'>
          <label htmlFor="email">E-mail</label>
          <input 
            type="email"  
            className='boder border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            {...register('email')}
            />
            {errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>}
        </div>

          
        <div className='flex flex-col gap-1 px-3'>
          <label htmlFor="password">Senha</label>
          <input 
            type="password"
            className='boder border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            {...register('password')}
          />
            {errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>}
        </div>


        <div className='flex flex-col gap-1 px-3'>
          <label htmlFor="" className='flex items-center justify-between'>Tecnologias

            <button type='button' onClick={addNewTech} className='text-emerald-500 text-xs'>
              Adicionar
            </button>

          </label>
         
          {fields.map((_field, _index) => {
            return(
              <div className='flex gap-1' key={_field.id}>
                <div className='flex-1 flex flex-col gap-1'>
                  <input 
                      type="text"
                      className='boder border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
                      {...register(`techs.${_index}.title`)}
                    />

                  {errors.techs?.[_index]?.title && <span className='text-red-500 text-sm'>{errors.techs?.[_index]?.title.message}</span>}

                </div>
                
                <div className='flex flex-col gap-1'>
                  <input 
                      type="number"
                      className='w-16 boder border-zinc-800 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
                      {...register(`techs.${_index}.knowledge`)}
                    />

                  {errors.techs?.[_index]?.knowledge && <span className='text-red-500 text-sm'>{errors.techs?.[_index]?.knowledge.message}</span>}

                </div>

              </div>
            )
          })}
          
          {errors.techs && <span className='text-red-500 text-sm'>{errors.techs.message}</span>}
        </div>
          

        <button
         type="submit"
         className='bg-emerald-500 font-semibold text-white h-10 hover:bg-emerald-600'
         >
          Enviar
         </button>
      </form>

      <pre className='text-emerald-500'>{output}</pre>
     </main>
  )
}

export default App


