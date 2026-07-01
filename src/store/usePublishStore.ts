import { create } from "zustand";
import type { LocationData } from "@/components/ui/LocationPicker";

interface SubletFormData {
  title: string;
  propertyType: string;
  spaceType: string;
  address: string;
  locationData?: LocationData;
  unit: string;
  hideAddress: boolean;
  roomTypes: string[];
  customRoomType: string;
  leaseTerms: string[];
  moveInDate: string;
  renewable?: boolean;
  images: (string | File)[];
  video?: File | string | null;
  videoDurationSec?: number | null;
  price: number | "";
  utilitiesIncluded: boolean;
  furnished: boolean;
  contactPhone: string;
  contactWechat: string;
  description: string;
}

interface ItemFormData {
  title: string;
  price: number | "";
  description: string;
  category: string;
  condition: string;
  location: string;
  images: (string | File)[];
}

interface PublishStore {
  // Sublet state
  subletData: SubletFormData;
  setSubletData: (data: Partial<SubletFormData>) => void;
  clearSubletData: () => void;

  // Item state
  itemData: ItemFormData;
  setItemData: (data: Partial<ItemFormData>) => void;
  clearItemData: () => void;
}

const initialSubletData: SubletFormData = {
  title: "",
  propertyType: "",
  spaceType: "",
  address: "",
  locationData: undefined,
  unit: "",
  hideAddress: false,
  roomTypes: [],
  customRoomType: "",
  leaseTerms: [],
  moveInDate: "",
  renewable: undefined,
  images: [],
  video: null,
  videoDurationSec: null,
  price: "",
  utilitiesIncluded: false,
  furnished: false,
  contactPhone: "",
  contactWechat: "",
  description: "",
};

const initialItemData: ItemFormData = {
  title: "",
  price: "",
  description: "",
  category: "",
  condition: "",
  location: "",
  images: [],
};

export const usePublishStore = create<PublishStore>((set) => ({
  subletData: initialSubletData,
  setSubletData: (data) =>
    set((state) => ({ subletData: { ...state.subletData, ...data } })),
  clearSubletData: () => set({ subletData: initialSubletData }),

  itemData: initialItemData,
  setItemData: (data) =>
    set((state) => ({ itemData: { ...state.itemData, ...data } })),
  clearItemData: () => set({ itemData: initialItemData }),
}));
