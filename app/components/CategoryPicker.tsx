import type React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type { Category } from '../database/schema';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on each side and 16px between

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory
}) => {
  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategoryId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && { borderColor: item.color, borderWidth: 2 }
        ]}
        onPress={() => onSelectCategory(item.id)}
      >
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            {/* TODO fix type later */}
            <Ionicons name={item.icon as any} size={24} color="#000000" />
          </View>
          <Text style={styles.categoryName}>{item.name}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category</Text>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    borderColor: 'transparent',
    borderWidth: 2,
  },
  blurContainer: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default CategoryPicker;