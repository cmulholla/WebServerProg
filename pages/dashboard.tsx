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

        const fetchBoardMembers = async () => {

            if (user == null) {
                console.log('user is null')
                return;
            }

            const { data: board_members, error } = await supabase
                .from('board_members')
                .select('*')
                .eq('user_id', user.id)
                .order('board_id', { ascending: true })
            
            if (board_members == null) {
                console.log('board members is null')
                return;
            }

            if (error) console.log('error', error)
            else setBoardMembers(board_members);
        }
    
        fetchBoards()
        fetchBoardMembers()
    }, [supabase, session, user]);

    const joinBoard = async (boardId: string) => {
        console.log('boardId', boardId)
        console.log('user', user?.id)

        const { data: board_member, error } = await supabase
            .from('board_members')
            .insert({ board_id: parseInt(boardId), user_id: user?.id })
            .select()
            .single()
    
        if (error) {
            setErrorText(error.message)
        } else {
            setBoardMembers([...board_members, board_member])
            //window.location.href = `/board/${boardId}`
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
            // create the board in the boards db
            const { data: board, error } = await supabase
                .from('boards')
                .insert({ name: boardName })
                .select()
                .single()
    
            if (error) {
                setErrorText(error.message)
            } else {
                setBoards([...boards, board])
            }

            if (board == null) {
                console.log('board is null')
                return;
            }
            else {
                console.log('boardid', board.id)
            }

            // add the user to the board in the board_members db
            const { data: board_member, error: errorBoardMember } = await supabase
                .from('board_members')
                .insert({ board_id: board.id, user_id: user?.id })
                .select()
                .single()
            
            window.location.href = `/board/${board.id}`
        }
    }

    // login with signup goes to first time page
    // on board creation, it incorrectly redirs you
    // on board creation, it does not assign you to the board

    const viewBoard = (boardId: number) => {
        window.location.href = `/board/${boardId}`
    }

    const onSubmit = (data: any) => createBoard(data.CreateBoard);
    const onJoin = (data: any) => joinBoard(data.JoinBoard);
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
                        onSubmit={handleSubmit((data: any) => {
                            if (event == null) {
                                return;
                            }
                            event.preventDefault();
                            onJoin(data);
                        })}
                        className="flex gap-2 my-2"
                    >
                        <input
                            type="text"
                            placeholder="Enter a board ID"
                            {...register("JoinBoard", { required: false, valueAsNumber: true})}
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
                            {...register("CreateBoard", { required: false })}
                            className="p-2 border-2 border-gray-400 rounded-lg"
                        />
                        <button
                            type="submit"
                            className="p-2 bg-blue-500 text-white rounded-lg"
                        >
                            Create Board
                        </button>
                    </form>
                    {boards.map((board) => {
                        if (board_members.some(b => b.board_id === board.id && b.user_id === session?.user.id)) {
                            return (
                                <div key={board.id} className="flex gap-2 my-2">
                                    <div>{board.name}</div>
                                    <button
                                        onClick={() => viewBoard(board.id)}
                                        className="p-2 bg-blue-500 text-white rounded-lg"
                                    >
                                        View Board
                                    </button>
                                    <button
                                        onClick={() => leaveBoard(board.id)}
                                        className="p-2 bg-red-500 text-white rounded-lg"
                                    >
                                        Leave Board
                                    </button>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </>
    )
}