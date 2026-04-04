import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, FontSize, BorderRadius } from "../../lib/theme";
import {
  getCategories,
  getMenuItems,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../lib/api";

interface Category {
  id: string;
  name: string;
  display_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  category_name?: string;
  emoji?: string;
  status: string;
  is_active: boolean;
  image?: string;
}

type TabView = "items" | "categories";

export default function MenuScreen() {
  const [activeTab, setActiveTab] = useState<TabView>("items");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal states
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Item form
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemEmoji, setItemEmoji] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemActive, setItemActive] = useState(true);

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [cats, items] = await Promise.all([
        getCategories(),
        getMenuItems({ category: selectedCategory || undefined, search: search || undefined }),
      ]);
      setCategories(Array.isArray(cats) ? cats : cats.results || []);
      setMenuItems(Array.isArray(items) ? items : items.results || []);
    } catch (error) {
      console.error("Erro ao carregar cardápio:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function onRefresh() {
    setRefreshing(true);
    fetchData();
  }

  // ---- ITEM CRUD ----
  function openNewItem() {
    setEditingItem(null);
    setItemName("");
    setItemDescription("");
    setItemPrice("");
    setItemEmoji("");
    setItemCategory(categories[0]?.id || "");
    setItemActive(true);
    setShowItemModal(true);
  }

  function openEditItem(item: MenuItem) {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price);
    setItemEmoji(item.emoji || "");
    setItemCategory(item.category);
    setItemActive(item.is_active);
    setShowItemModal(true);
  }

  async function handleSaveItem() {
    if (!itemName.trim() || !itemPrice.trim() || !itemCategory) {
      Alert.alert("Erro", "Preencha nome, preço e categoria");
      return;
    }

    try {
      const data = {
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        emoji: itemEmoji,
        category: itemCategory,
        is_active: itemActive,
      };

      if (editingItem) {
        await updateMenuItem(editingItem.id, data);
      } else {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
        await createMenuItem(formData);
      }
      setShowItemModal(false);
      fetchData();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o item");
    }
  }

  function handleDeleteItem(item: MenuItem) {
    Alert.alert("Remover Item", `Remover "${item.name}" do cardápio?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMenuItem(item.id);
            fetchData();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover o item");
          }
        },
      },
    ]);
  }

  // ---- CATEGORY CRUD ----
  function openNewCategory() {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryOrder("0");
    setShowCategoryModal(true);
  }

  function openEditCategory(cat: Category) {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryOrder(String(cat.display_order));
    setShowCategoryModal(true);
  }

  async function handleSaveCategory() {
    if (!categoryName.trim()) {
      Alert.alert("Erro", "Preencha o nome da categoria");
      return;
    }

    try {
      const data = {
        name: categoryName,
        display_order: parseInt(categoryOrder) || 0,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a categoria");
    }
  }

  function handleDeleteCategory(cat: Category) {
    Alert.alert("Remover Categoria", `Remover "${cat.name}"? Os itens serão desvinculados.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(cat.id);
            fetchData();
          } catch (error) {
            Alert.alert("Erro", "Não foi possível remover a categoria");
          }
        },
      },
    ]);
  }

  async function toggleItemActive(item: MenuItem) {
    try {
      await updateMenuItem(item.id, { is_active: !item.is_active });
      fetchData();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o item");
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "items" && styles.tabBtnActive]}
          onPress={() => setActiveTab("items")}
        >
          <View style={styles.tabBtnContent}>
            <Ionicons name="restaurant-outline" size={16} color={activeTab === "items" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "items" && styles.tabBtnTextActive]}>
              Itens
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "categories" && styles.tabBtnActive]}
          onPress={() => setActiveTab("categories")}
        >
          <View style={styles.tabBtnContent}>
            <Ionicons name="folder-outline" size={16} color={activeTab === "categories" ? Colors.white : Colors.textSecondary} />
            <Text style={[styles.tabBtnText, activeTab === "categories" && styles.tabBtnTextActive]}>
              Categorias
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === "items" ? (
        <>
          {/* Search + Category Filter */}
          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={18} color={Colors.textLight} />
              <TextInput
                style={styles.searchField}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar item..."
                placeholderTextColor={Colors.textLight}
                onSubmitEditing={fetchData}
              />
            </View>
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, name: "Todos" }, ...categories]}
            keyExtractor={(item) => item.id || "all"}
            contentContainerStyle={styles.categoryFilter}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.catChip,
                  selectedCategory === item.id && styles.catChipActive,
                ]}
                onPress={() => {
                  setSelectedCategory(item.id);
                  setLoading(true);
                }}
              >
                <Text
                  style={[
                    styles.catChipText,
                    selectedCategory === item.id && styles.catChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          <FlatList
            data={menuItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum item encontrado</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.menuCard, !item.is_active && styles.menuCardInactive]}>
                <View style={styles.menuCardHeader}>
                  <View style={styles.menuIconWrap}>
                    <Ionicons name="restaurant" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.menuPrice}>
                      R$ {parseFloat(item.price).toFixed(2).replace(".", ",")}
                    </Text>
                  </View>
                  <Switch
                    value={item.is_active}
                    onValueChange={() => toggleItemActive(item)}
                    trackColor={{ false: Colors.border, true: Colors.successLight }}
                    thumbColor={item.is_active ? Colors.success : Colors.textLight}
                  />
                </View>
                {item.description ? (
                  <Text style={styles.menuDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.menuActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => openEditItem(item)}
                  >
                    <Ionicons name="pencil" size={16} color={Colors.info} />
                    <Text style={styles.editBtnText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Ionicons name="trash" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* FAB */}
          <TouchableOpacity style={styles.fab} onPress={openNewItem}>
            <Ionicons name="add" size={28} color={Colors.white} />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma categoria</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryOrder}>Ordem: {item.display_order}</Text>
                </View>
                <View style={styles.categoryActions}>
                  <TouchableOpacity onPress={() => openEditCategory(item)}>
                    <Ionicons name="pencil" size={20} color={Colors.info} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteCategory(item)}>
                    <Ionicons name="trash" size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <TouchableOpacity style={styles.fab} onPress={openNewCategory}>
            <Ionicons name="add" size={28} color={Colors.white} />
          </TouchableOpacity>
        </>
      )}

      {/* Item Modal */}
      <Modal visible={showItemModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingItem ? "Editar Item" : "Novo Item"}
                </Text>
                <TouchableOpacity onPress={() => setShowItemModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.fieldLabel}>Nome *</Text>
              <TextInput
                style={styles.fieldInput}
                value={itemName}
                onChangeText={setItemName}
                placeholder="Nome do item"
              />

              <Text style={styles.fieldLabel}>Descrição</Text>
              <TextInput
                style={[styles.fieldInput, { height: 80, textAlignVertical: "top" }]}
                value={itemDescription}
                onChangeText={setItemDescription}
                placeholder="Descrição do item"
                multiline
              />

              <Text style={styles.fieldLabel}>Preço *</Text>
              <TextInput
                style={styles.fieldInput}
                value={itemPrice}
                onChangeText={setItemPrice}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />

              <Text style={styles.fieldLabel}>Categoria *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catChip,
                      itemCategory === cat.id && styles.catChipActive,
                      { marginRight: Spacing.sm },
                    ]}
                    onPress={() => setItemCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        itemCategory === cat.id && styles.catChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.switchRow}>
                <Text style={styles.fieldLabel}>Ativo</Text>
                <Switch
                  value={itemActive}
                  onValueChange={setItemActive}
                  trackColor={{ false: Colors.border, true: Colors.successLight }}
                  thumbColor={itemActive ? Colors.success : Colors.textLight}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveItem}>
                <Text style={styles.saveButtonText}>
                  {editingItem ? "Salvar Alterações" : "Criar Item"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Nome *</Text>
            <TextInput
              style={styles.fieldInput}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Nome da categoria"
            />

            <Text style={styles.fieldLabel}>Ordem de exibição</Text>
            <TextInput
              style={styles.fieldInput}
              value={categoryOrder}
              onChangeText={setCategoryOrder}
              placeholder="0"
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCategory}>
              <Text style={styles.saveButtonText}>
                {editingCategory ? "Salvar" : "Criar Categoria"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    padding: 4,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnContent: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  tabBtnText: { fontSize: FontSize.md, fontWeight: "600", color: Colors.textSecondary },
  tabBtnTextActive: { color: Colors.white },
  searchRow: { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchField: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSize.md, color: Colors.text },
  categoryFilter: { paddingHorizontal: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  catChipActive: { backgroundColor: Colors.primary },
  catChipText: { fontSize: FontSize.sm, fontWeight: "600", color: Colors.textSecondary },
  catChipTextActive: { color: Colors.white },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 100 },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuCardInactive: { opacity: 0.5 },
  menuCardHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  menuInfo: { flex: 1 },
  menuName: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text },
  menuPrice: { fontSize: FontSize.md, fontWeight: "600", color: Colors.primary },
  menuDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  menuActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  editBtnText: { fontSize: FontSize.sm, color: Colors.info, fontWeight: "600" },
  deleteBtn: { padding: 4 },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text },
  categoryOrder: { fontSize: FontSize.sm, color: Colors.textSecondary },
  categoryActions: { flexDirection: "row", gap: Spacing.md },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: { alignItems: "center", paddingTop: Spacing.xxl * 2 },
  emptyText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: FontSize.xxl, fontWeight: "700", color: Colors.text },
  fieldLabel: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  fieldInput: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: "700" },
});
