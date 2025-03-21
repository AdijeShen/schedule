import { getAllTasks, addTask } from './taskService';

// 将任务导出为CSV格式
export const exportTasksToCSV = async () => {
  try {
    const tasks = await getAllTasks();
    const headers = ['ID', '标题', '描述', '类型', '开始时间', '截止时间', '创建时间', '状态'];
    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.description,
      task.type,
      task.startTime || '',
      task.dueDate,
      task.createdAt,
      task.status || 'pending'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tasks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('导出任务失败:', error);
    throw error;
  }
};

// 从CSV文件导入任务
export const importTasksFromCSV = async (file) => {
  try {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const headers = lines[0].split(',');

    const tasks = lines.slice(1).map(line => {
      const values = line.split(',').map(value => 
        value.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
      );
      
      return {
        id: values[0],
        title: values[1],
        description: values[2],
        type: values[3],
        startTime: values[4] || null,
        dueDate: values[5],
        createdAt: values[6],
        status: values[7] || 'pending'
      };
    });

    for (const task of tasks) {
      // 检查任务是否已存在
      const existingTask = await fetch(`${API_BASE_URL}/tasks/${task.id}`).then(res => res.ok ? res.json() : null);
      if (!existingTask) {
        await addTask(task);
      }
    }

    return tasks.length;
  } catch (error) {
    console.error('导入任务失败:', error);
    throw error;
  }
};