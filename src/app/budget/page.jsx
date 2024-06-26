"use client";
import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import NavBar from "@/components/Nav";
import BudgetCard from "@/components/BudgetCard";
import EditBudgetModal from "@/components/EditBudgetModal";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/context";
import DataService from "@/lib/fetch";
import { readUserSession } from "@/lib/action";
import DeleteBudgetModal from "@/components/DeleteBudgetModal";
import Cookies from "js-cookie";

const BudgetCategory = () => {
  const router = useRouter();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isUser, setUser } = useAppContext();
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const openEditModal = (budget) => {
    setSelectedBudget(budget);
    setEditModalOpen(true);
  };

  const openDeleteModal = (budget) => {
    setSelectedBudget(budget);
    setDeleteModalOpen(true);
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true)
      const budgets = await DataService.getDataNoAuth("/budget/api");
      setBudgets(budgets);
      setLoading(false);
    } catch (error) {
      toast.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deleteModalOpen || !editModalOpen) {
      fetchBudgets();
    }
  }, [editModalOpen, deleteModalOpen]);

  useEffect(() => {
    const getUserAndRedirect = async () => {
      if (!isUser) {
        try {
          const { user } = await readUserSession();
          //setUser(user.email);
          Cookies.set('expense-user',user.email, { expires: 7 });
          router.prefetch("/budget");
        } catch (error) {
          router.replace("/login");
        }
      }
    };

    getUserAndRedirect();
  }, [isUser,router]);

  return (
    <>
      <NavBar  isUser={Cookies.get('expense-user')}/>
      <div className="w-full px-6 py-6 mx-auto min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex justify-start">
          <div className="w-full">
            <div className="flex justify-between mb-8">
              <h5 className="text-2xl font-semibold text-white">
                Your Budgets
              </h5>
              <button
                className="bg-purple-600 hover:bg-black-500 text-white font-semibold px-4 py-2 rounded-lg"
                onClick={() => openEditModal(null)}
              >
                Create New Budget
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="flex flex-col items-center justify-center flex-grow">
              <svg
                className="animate-spin h-10 w-10 text-blue-500 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 4.418 3.582 8 8 8v-4zm14-1.162A7.963 7.963 0 0120 12h4c0 4.418-3.582 8-8 8v-4z"
                ></path>
              </svg>
              <p className="text-white text-4xl font-bold">Loading...</p>
            </div>
          </div>
        ) : budgets.length === 0 ? (
          <header className="flex flex-col items-center justify-center flex-grow">
            <div className="w-2/3 text-center">
              <h1 className="text-white text-4xl font-bold mb-4">
                No Record Found
              </h1>
            </div>
            <div className="relative w-2/3 h-80">
              <Image
                src={`/expense.svg`}
                alt="Expense Tracker"
                layout="fill"
                objectFit="contain"
              />
            </div>
          </header>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {budgets?.length > 0 &&
                budgets?.map((budget, index) => (
                  <BudgetCard
                    budget={budget}
                    key={index}
                    openDeleteModal={openDeleteModal}
                    openEditModal={openEditModal}
                  />
                ))}
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <DeleteBudgetModal budget={selectedBudget} onClose={closeModals} />
        )}
        {editModalOpen && (
          <EditBudgetModal
            updatedBudget={selectedBudget}
            onClose={closeModals}
          />
        )}
      </div>
    </>
  );
};

export default BudgetCategory;
