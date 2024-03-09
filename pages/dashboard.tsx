// pages/dashboard.tsx
// This page will display:
// - the header
// - a text input to join a new board
// - a button to create a new board
// - a list of boards already joined
// - a button to leave a board (if the user is a member)

// The form will be created with react-hook-form, and the boards will be displayed using the Board component.
// The Board component will have a button to join the board if the user is not a member, 
//   and a button to leave the board if the user is a member.

import Head from 'next/head'
import { Database } from '@/lib/schema'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import React, { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { useForm } from 'react-hook-form';

type Board = Database['public']['Tables']['boards']['Row']
type BoardMember = Database['public']['Tables']['board_members']['Row']

export default function Dashboard() {
  const session = useSession()
  const supabase = useSupabaseClient<Database>()
  const [boards, setBoards] = useState<Board[]>([])
  const [board_members, setBoardMembers] = useState<BoardMember[]>([])
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorText, setErrorText] = useState('')
  const [newBoardText, setNewBoardText] = useState('')
    

  const user = session?.user

    useEffect(() => {
        const fetchBoards = async () => {
        const { data: boards, error } = await supabase
            .from('boards')
            .select('*')
            .order('id', { ascending: true })
    
        if (error) console.log('error', error)
        else setBoards(boards)
        }
    
        fetchBoards()
    }, [supabase])

    const joinBoard = async (boardId: number) => {
        const { data: board_member, error } = await supabase
            .from('board_members')
            .insert({ board_id: boardId, user_id: user?.id })
            .select()
            .single()
    
        if (error) {
            setErrorText(error.message)
        } else {
            setBoardMembers([...board_members, board_member])
        }
    }

    const leaveBoard = async (boardId: number) => {
        try {
            await supabase.from('board_members').delete().eq('board_id', boardId).eq('user_id', user?.id).throwOnError()
            setBoards(boards.filter((x) => x.id != boardId))
        } catch (error) {
            console.log('error', error)
        }
    }

    const createBoard = async (boardText: string) => {
        let boardName = boardText.trim()
        if (boardName.length) {
            const { data: board, error } = await supabase
                .from('boards')
                .insert({ name: boardName })
                .select()
                .single()
    
            if (error) {
                setErrorText(error.message)
            } else {
                setBoards([...boards, board])
                setNewBoardText('')
            }
        }
    }

    const onSubmit = (data: any) => createBoard(data.Board);
    console.log(errors);

    return (
        <>
            <Header session={session} supabase={supabase} />
            <Head>
                <title>Scrum AI</title>
                <meta name="description" content="Scrum AI Dashboard" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="w-full h-full bg-gray-200">
                <div
                    className="w-full h-full flex flex-col justify-center items-center p-4"
                    style={{ minWidth: 250, maxWidth: 600, margin: 'auto' }}
                >
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex gap-2 my-2"
                    >
                        <input
                            type="text"
                            placeholder="Enter a board ID"
                            {...register("Board", { required: true })}
                            className="p-2 border-2 border-gray-400 rounded-lg"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded-lg"
                        >
                            Join Board
                        </button>
                    </form>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="flex gap-2 my-2"
                    >
                        <input
                            type="text"
                            placeholder="Enter a new board name"
                            {...register("Board", { required: true })}
                            className="p-2 border-2 border-gray-400 rounded-lg"
                            value={newBoardText}
                            onChange={(e) => setNewBoardText(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded-lg"
                        >
                            Create Board
                        </button>
                    </form>
                    {boards.map((board) => (
                        <div key={board.id} className="flex gap-2 my-2">
                            <div>{board.name}</div>
                            {board_members.includes({board_id: board.id, user_id: session?.user.id}) ? (
                                <button
                                    onClick={() => leaveBoard(board.id)}
                                    className="p-2 bg-red-500 text-white rounded-lg"
                                >
                                    Leave Board
                                </button>
                            ) : (
                                <button
                                    onClick={() => joinBoard(board.id)}
                                    className="p-2 bg-green-500 text-white rounded-lg"
                                >
                                    View Board
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}