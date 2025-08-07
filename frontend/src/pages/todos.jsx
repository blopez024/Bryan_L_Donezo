import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import getAxiosClient from '../axios-instance';

const BASE_URL = 'http://localhost:8080';

export default function Todos() {
  const modalRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Fetch todos
  const { data, isError, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const axiosInstance = await getAxiosClient();
      const { data } = await axiosInstance.get(`${BASE_URL}/todos`);
      return data;
    },
  });

  // Create a new todo mutation
  const { mutate: createNewTodo } = useMutation({
    mutationKey: ['newTodo'],
    mutationFn: async (newTodo) => {
      const axiosInstance = await getAxiosClient();
      const { data } = await axiosInstance.post(`${BASE_URL}/todos`, newTodo);
      return data;
    },
    onSuccess: () => {
      // 1. Invalidate the query to refetch and show the new todo
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      // 2. Reset the form fields
      reset();
      // 3. Close the modal
      closeModal();
    },
    onError: (error) => {
      alert('Error creating todo: ', error.message);
    },
  });

  // Mark todo as completed mutation
  const { mutate: markAsCompleted } = useMutation({
    mutationKey: ['markAsCompleted'],
    mutationFn: async (todoId) => {
      const axiosInstance = await getAxiosClient();

      const { data } = await axiosInstance.put(
        `${BASE_URL}/todos/${todoId}/completed`,
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('todos');
    },
    onError: (error) => {
      alert('Error updating todo: ', error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading Todos...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-4 text-red-600">
        There was an error loading todos.
      </div>
    );
  }

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const closeModal = () => {
    modalRef.current?.close();
  };

  const handleNewTodo = (values) => {
    createNewTodo(values);
  };

  function NewTodoButton() {
    return (
      <button className="btn btn-primary" onClick={openModal}>
        New Todo
      </button>
    );
  }

  function TodoModal() {
    return (
      <dialog ref={modalRef} className="modal" aria-modal="true" role="dialog">
        <div className="modal-box">
          <h3 className="font-bold text-lg">New Todo</h3>
          <form onSubmit={handleSubmit(handleNewTodo)}>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Name of Todo</span>
              </div>
              <input
                type="text"
                placeholder="e.g., Finish code review"
                className="input input-bordered w-full"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <input
                type="text"
                placeholder="e.g., Implement suggestions"
                className="input input-bordered w-full"
                {...register('description', {
                  required: 'Description is required',
                })}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </label>
            <div className="modal-action">
              <button
                type="button"
                onClick={closeModal}
                className="btn btn-ghost"
              >
                Close
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Todo'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    );
  }

  function TodoItemList() {
    return (
      <div className="w-lg h-sm flex column items-center justify-center gap-4">
        {data && data.success && data.todos.length >= 1 ? (
          <ul className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
            {data.todos.map((todo) => (
              <li
                key={todo.id}
                className="flex justify-between items-center p-4 border rounded-lg shadow-sm "
              >
                <div className="w-md">
                  <h3 className="text-lg">{todo.name}</h3>
                  <p className="text-sm">{todo.description}</p>
                </div>
                <div className="w-md">
                  <label className="swap">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      disabled={todo.completed}
                      onChange={() => markAsCompleted(todo.id)}
                    />
                    <div className="swap-on">Yes</div>
                    <div className="swap-off">No</div>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No todos found.</p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center mt-6 mb-6">
        <NewTodoButton />
      </div>
      <TodoItemList />
      <TodoModal />
    </>
  );
}
