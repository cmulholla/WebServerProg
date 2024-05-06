import { useRouter } from 'next/router';
import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState, ReactDOM } from 'react'
import Header from '@/components/Header'
import { Database } from '@/lib/schema'
import { useForm } from 'react-hook-form';

type BoardMember = Database['public']['Tables']['board_members']['Row']
type UserData = Database['public']['Tables']['UserData']['Row']

// This file will be the redirect page for the add task button
// This add task page will include:
// - the task title input
// - the task description input
// - the task assignee dropdown
// - the task submit button


export default function AddTask() {
    const session = useSession()
    const supabase = useSupabaseClient<Database>()
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [errorText, setErrorText] = useState('')
    const router = useRouter();
    const [boardId, setBoardId] = useState<string | string[] | undefined>(router.query.boardID);
  
    // the board contains the board ID and the board title
    const [board, setBoard] = useState<{ id: number, name: string, proficiency: number }>({ id: 0, name: '', proficiency: 0 })
  
    // the board members contain all of the board members ids for all of the boards
    const [board_members, setBoardMembers] = useState<BoardMember[]>([])
  
    // the board users contain all of the board members UserData for the current board
    const [board_users, setBoardUsers] = useState<UserData[]>([])
  
    // the UserData contains all of the user data for all of the users
    const [UserData, setUsers] = useState<Database['public']['Tables']['UserData']['Row'][]>([]);
  
    const user = session?.user;
  
    // Wait until router is ready to access query params
  
    useEffect(() => {
      if (router.isReady) {
        setBoardId(router.query.boardID);
        console.log('Board ID: ', router.query.boardID)
      }
  
      const fetchBoard = async () => {
        const { data: board, error } = await supabase
          .from('boards')
          .select('*')
          .eq('id', parseInt(boardId as string))
          .order('id', { ascending: true })
        
        if (error) console.log('error', error)
        else setBoard(board[0])
      }
  
      const fetchBoardMembers = async () => {
  
        if (user == null) {
          console.log('user is null')
          return;
        }
  
        const { data: board_members, error } = await supabase
            .from('board_members')
            .select('*')
            .eq('board_id', boardId)
            .order('user_id', { ascending: true })
        
        if (board_members == null) {
          console.log('board members is null')
          return;
        }
  
        if (error) console.log('error', error)
        else setBoardMembers(board_members);
      }
  
      const fetchUserData = async () => {
        const { data: users, error } = await supabase
          .from('UserData')
          .select('*')
        
        if (error) console.log('error', error)
        else setUsers(users)
      }
  
      const setupUsers = async () => {
        // users is already set
        if (board_users.length > 0) {
          console.log('board_users already set')
          console.log(board_users)
          return;
        }
  
        board_members.forEach((member) => {
          if (member.board_id === parseInt(boardId as string)) {
            const usern = UserData.find((usern) => usern.user_id === member.user_id)
  
            if (usern) {
              setBoardUsers((board_users) => [...board_users, usern])
            }
          }
        })
      }
    
      fetchBoard()
      fetchBoardMembers()
      fetchUserData()
      setupUsers()
    }, [supabase, session, user, router, boardId]);

    const onSubmit = async (data: any) => {
        const { title, description, assignee_id, status_column, to_generate } = data;
        const { data: tasks, error } = await supabase
        .from('board_ticket_data')
        .insert([
            {board_id: parseInt(boardId as string), title, description, assignee_id, status_column: 'To Do', to_generate: to_generate}
        ])
        if (error) {
            console.log('error', error)
            setErrorText('An error occurred while adding the task.')
        }
        else {
            router.push(`/board/${boardId}`)
        }
    }

    return (
      <>
        <Head>
            <title>Add Task</title>
        </Head>
        <Header session={session} supabase={supabase} boardName={board.name + " - proficiency: " + board.proficiency} board_members={board_users}/>
        <div
            className="w-full h-full flex flex-col justify-center items-center p-4"
            style={{ minWidth: 250, margin: 'auto' }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="Title"
              className="p-2 border-2 border-gray-400 rounded-lg"
              style={{ display: 'block', marginBottom: '10px', minWidth: '250px'}}
              {...register("title", {})}
            />
            <textarea
              placeholder="Description"
              className="p-2 border-2 border-gray-400 rounded-lg"
              style={{ minHeight: '100px', display: 'block', marginBottom: '10px', minWidth: '250px' }}
              {...register("description", {})}
            />
            <label htmlFor="assignee_id" style={{ display: 'block', marginBottom: '10px' }}>
              Assignee:
            </label>
            <select
              className='p-2 border-2 border-gray-400 rounded-lg'
              style={{ display: 'block', marginBottom: '10px', minWidth: '250px' }}
              {...register('assignee_id', { required: true })}
            >
              {board_users.map((user) => (
                <option key={user.user_id} value={user.user_id}>{user.username}</option>
              ))}
            </select>
            <label htmlFor="AI"
              style={{marginRight: '10px' }}>
              Generate using AI:
            </label>
            <input
              type="checkbox"
              placeholder="Generate using AI"
              className=''
              style={{marginBottom: '30px' }}
              {...register("to_generate", {})}
            />
            <input type="hidden" {...register('status_column', { value: 'To Do' })} />
            <button type="submit" 
              style={{ display: 'block', marginBottom: '10px', minWidth: '250px' }} className="p-2 bg-blue-500 text-white rounded-lg">Add Task</button>
          </form>
        </div>
      </>
    )
}