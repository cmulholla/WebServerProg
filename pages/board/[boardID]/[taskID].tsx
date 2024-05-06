// task.tsx
// this file will be used to display a task when it is clicked on to show more details

import { useRouter } from 'next/router';
import Head from 'next/head'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState, ReactDOM } from 'react'
import Header from '@/components/Header'
import { Database } from '@/lib/schema'
import { useForm } from 'react-hook-form';

type BoardMember = Database['public']['Tables']['board_members']['Row']
type UserData = Database['public']['Tables']['UserData']['Row']
type Ticket = Database['public']['Tables']['board_ticket_data']['Row']

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
    const [taskID, setTaskID] = useState<string | string[] | undefined>(router.query.taskID);

    // the ticket contains the board_ticket_data for the current task
    const [ticket, setTicket] = useState<Ticket>({ ticket_id: 0, title: '', description: '', status_column: '', assignee_id: '', board_id: 0, to_generate: false, grade: 0 })
  
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
        setTaskID(router.query.taskID);
        console.log('Board ID: ', router.query.boardID)
        console.log('Task ID: ', router.query.taskID)
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

      const fetchTicket = async () => {
        const { data: ticket, error } = await supabase
          .from('board_ticket_data')
          .select('*')
          .eq('ticket_id', parseInt(taskID as string))
          .eq('board_id', parseInt(boardId as string))
        
        if (error) console.log('error', error)
        else {
          console.log('ticket', ticket)
          setTicket(ticket[0])
        }
      }
    
      fetchBoard()
      fetchBoardMembers()
      fetchUserData()
      fetchTicket()
      setupUsers()
    }, [supabase, session, user, router, boardId]);

    const onSubmit = async (data: any) => {
      let { description } = data;

      const { data: tasks, error } = await supabase
        .from('board_ticket_data')
        .update({status_column: "Done", description: ticket.description + "\n<h2>User input:</h2>\n" + description, to_generate: true})
        .eq('ticket_id', parseInt(taskID as string))
        .eq('board_id', parseInt(boardId as string))
        .single()
    }

    return (
      <>
        <Head>
            <title>Assignment</title>
        </Head>
        <Header session={session} supabase={supabase} boardName={board.name + " - proficiency: " + board.proficiency} board_members={board_users}/>
        {/* This is the ticket information, including description. You can update the column from here too. */}
        <div>
          <h1 style={{ marginLeft: '20px' }}>{ticket.title}</h1>
          <div style={{ marginLeft: '40px' }}>
            <div dangerouslySetInnerHTML={{ __html: ticket.description}} />
            <form onSubmit={handleSubmit((data: any) => {
                            if (event == null) {
                                return;
                            }
                            onSubmit(data);
                        })}>
              <textarea {...register('description')} style={{ width: '95%', height: '200px', border: '1px solid black', padding: '10px' }} placeholder='Type completed assignment details here for AI grading' />
              <button type="submit" value="Submit" style={{ display: 'block', minWidth: '150px' }} className='p-2 bg-blue-500 text-white rounded-lg'>Complete Assignment</button>
            </form>
          </div>
        </div>
      </>
    )
}