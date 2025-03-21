import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Tooltip, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Stack, Rating, TextareaAutosize } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, SentimentVerySatisfied, SentimentSatisfied, SentimentDissatisfied, SentimentVeryDissatisfied, SentimentNeutral } from '@mui/icons-material';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { getTimeBlocksByDate, updateTimeBlocks, updateTimeBlockNote, getAllTimeBlockStats, getDailySummary, updateDailySummary } from '../services/timeBlockService';

const BLOCKS_PER_HOUR = 4; // 15分钟一个时间块
const HOURS_PER_DAY = 24;
const TOTAL_BLOCKS = BLOCKS_PER_HOUR * HOURS_PER_DAY;

// 定义预设颜色
const PRESET_COLORS = {
    red: '#ff4d4f',
    orange: '#fa8c16',
    yellow: '#faad14',
    green: '#52c41a',
    blue: '#1890ff',
    purple: '#722ed1',
};

// 添加防抖函数
const debounce = (func, delay) => {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

function TimeBlockView() {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [timeBlocks, setTimeBlocks] = useState(Array(TOTAL_BLOCKS).fill().map(() => ({ status: null, color: null, note: '' })));
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS.red);
    const [contextMenu, setContextMenu] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [colorStats, setColorStats] = useState({});
    const [pendingSave, setPendingSave] = useState(false);
    const [dailySummary, setDailySummary] = useState('');
    const [dailyRating, setDailyRating] = useState(0);
    const [summaryPendingSave, setSummaryPendingSave] = useState(false);

    useEffect(() => {
        loadTimeBlocks();
        loadColorStats();
        loadDailySummary();
    }, [selectedDate]);

    const loadColorStats = async () => {
        const stats = await getAllTimeBlockStats();
        setColorStats(stats);
    };

    const loadTimeBlocks = async () => {
        const blocks = await getTimeBlocksByDate(selectedDate);
        // 确保每个时间块都有一个有效的对象结构，即使服务器返回空数组也会创建默认的时间块数组
        const defaultBlocks = Array(TOTAL_BLOCKS).fill().map(() => ({ status: null, color: null, note: '' }));
        
        if (blocks && blocks.length) {
            // 将服务器返回的数据与默认数组合并
            const newBlocks = [...defaultBlocks];
            blocks.forEach((block, index) => {
                if (index < TOTAL_BLOCKS) {
                    // 兼容旧数据结构
                    if (block.status !== null && block.status !== undefined && block.color === undefined) {
                        const oldColorMap = {
                            0: PRESET_COLORS.red,
                            1: PRESET_COLORS.yellow,
                            2: PRESET_COLORS.green
                        };
                        block.color = oldColorMap[block.status] || null;
                    }
                    newBlocks[index] = block;
                }
            });
            setTimeBlocks(newBlocks);
        } else {
            setTimeBlocks(defaultBlocks);
        }
        
        console.log('加载时间块：', selectedDate.format('YYYY-MM-DD'), blocks && blocks.length ? '有数据' : '无数据');
    };

    const handleContextMenu = (event, index) => {
        event.preventDefault();  // 阻止浏览器默认右键菜单
        event.stopPropagation(); // 阻止事件冒泡，避免触发 onClick
        setContextMenu({ mouseX: event.clientX, mouseY: event.clientY });
        setSelectedBlock(index);
        setCurrentNote(timeBlocks[index].note || '');
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleOpenNoteDialog = () => {
        setNoteDialogOpen(true);
        handleCloseContextMenu();
    };

    const handleCloseNoteDialog = () => {
        setNoteDialogOpen(false);
        setSelectedBlock(null);
    };

    const handleSaveNote = async () => {
        if (selectedBlock !== null) {
            // 更新本地状态
            setTimeBlocks(prevBlocks => {
                const newBlocks = [...prevBlocks];
                newBlocks[selectedBlock] = {
                    ...newBlocks[selectedBlock],
                    note: currentNote
                };
                return newBlocks;
            });
            
            // 保存到服务器
            await updateTimeBlockNote(selectedDate, selectedBlock, currentNote);
            setPendingSave(true);
            handleCloseNoteDialog();
        }
    };

    const handleBlockClick = (index) => {
        setTimeBlocks(prevBlocks => {
            const newBlocks = [...prevBlocks];
            const currentBlock = newBlocks[index];
            
            // 新逻辑：在选中的颜色和无色之间切换
            if (currentBlock.color === selectedColor) {
                newBlocks[index] = { ...currentBlock, color: null };
            } else {
                newBlocks[index] = { ...currentBlock, color: selectedColor };
            }
            
            return newBlocks;
        });
        setPendingSave(true);
    };

    // 使用防抖函数来减少服务器请求
    const debouncedSave = useCallback(
      debounce(async (date, blocks) => {
        try {
          console.log('保存时间块...');
          await updateTimeBlocks(date, blocks);
          console.log('时间块保存成功');
        } catch (error) {
          console.error('保存时间块失败:', error);
        } finally {
          setPendingSave(false);
        }
      }, 1000),
      []
    );

    // 替换原来的 useEffect
    useEffect(() => {
        if (pendingSave) {
            debouncedSave(selectedDate, timeBlocks);
        }
    }, [timeBlocks, pendingSave, debouncedSave, selectedDate]);

    const formatTime = (blockIndex) => {
        const hour = Math.floor(blockIndex / BLOCKS_PER_HOUR);
        const minute = (blockIndex % BLOCKS_PER_HOUR) * 15;
        const nextHour = Math.floor((minute + 15) / 60) + hour;
        const nextMinute = (minute + 15) % 60;
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    // 将日期时间块显示的主要颜色用于月历
    const getDayColor = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        return colorStats[dateStr] || null;
    };

    const loadDailySummary = async () => {
        try {
            const summary = await getDailySummary(selectedDate);
            setDailySummary(summary.content || '');
            setDailyRating(summary.rating || 0);
        } catch (error) {
            console.error('获取每日总结失败:', error);
            setDailySummary('');
            setDailyRating(0);
        }
    };

    const handleDailySummaryChange = (e) => {
        setDailySummary(e.target.value);
        setSummaryPendingSave(true);
    };

    const handleDailyRatingChange = (_, newValue) => {
        setDailyRating(newValue);
        setSummaryPendingSave(true);
    };

    // 使用防抖函数来减少服务器请求 (每日总结)
    const debouncedSaveSummary = useCallback(
      debounce(async (date, summary, rating) => {
        try {
          console.log('保存每日总结...');
          await updateDailySummary(date, summary, rating);
          console.log('每日总结保存成功');
        } catch (error) {
          console.error('保存每日总结失败:', error);
        } finally {
          setSummaryPendingSave(false);
        }
      }, 1000),
      []
    );

    // 监听每日总结变化
    useEffect(() => {
        if (summaryPendingSave) {
            debouncedSaveSummary(selectedDate, dailySummary, dailyRating);
        }
    }, [dailySummary, dailyRating, summaryPendingSave, debouncedSaveSummary, selectedDate]);

    // 自定义评分图标
    const customIcons = {
        1: {
            icon: <SentimentVeryDissatisfied color="error" />,
            label: '很差',
        },
        2: {
            icon: <SentimentDissatisfied color="warning" />,
            label: '较差',
        },
        3: {
            icon: <SentimentNeutral color="action" />,
            label: '一般',
        },
        4: {
            icon: <SentimentSatisfied color="success" />,
            label: '不错',
        },
        5: {
            icon: <SentimentVerySatisfied color="success" />,
            label: '很好',
        },
    };

    function IconContainer(props) {
        const { value, ...other } = props;
        return <span {...other}>{customIcons[value].icon}</span>;
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                时间块视图
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                {/* 左侧区域 - 时间块和颜色选择器 */}
                <Paper sx={{ p: 2, flex: 3 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            {selectedDate.format('YYYY年MM月DD日')}的时间块
                        </Typography>
                        
                        {/* 颜色选择器 */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                选择颜色：
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                {Object.entries(PRESET_COLORS).map(([name, color]) => (
                                    <Paper
                                        key={name}
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            backgroundColor: color,
                                            cursor: 'pointer',
                                            border: selectedColor === color ? '2px solid black' : 'none',
                                            '&:hover': { opacity: 0.8 }
                                        }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </Stack>
                        </Box>
                        
                        {/* 重新设计的时间块网格 */}
                        <Grid container spacing={0.5}>
                            {timeBlocks.map((block, index) => (
                                <Grid item xs={2} sm={1.5} md={1} key={index}>
                                    <Paper
                                        sx={{
                                            height: 35,
                                            backgroundColor: block.color || '#f0f0f0',
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.8 },
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.2s ease-in-out',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            p: '2px',
                                            overflow: 'hidden'
                                        }}
                                        onClick={() => handleBlockClick(index)}
                                        onContextMenu={(e) => handleContextMenu(e, index)}
                                    >
                                        <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 'bold', lineHeight: 1 }}>
                                            {formatTime(index)}
                                        </Typography>
                                        {block.note && (
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    fontSize: '0.55rem',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '100%',
                                                    lineHeight: 1
                                                }}
                                            >
                                                {block.note}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                点击时间块在所选颜色和无色之间切换，右键点击添加备注
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* 右侧区域 - 日历视图和每日总结 */}
                <Paper sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* 日历部分 */}
                    <Box sx={{ mb: 3 }}>
                        <div style={{ width: '100%', padding: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <IconButton onClick={() => setSelectedDate(selectedDate.subtract(1, 'month'))} size="small">
                                    <ChevronLeftIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="subtitle1">
                                    {selectedDate.format('YYYY年MM月')}
                                </Typography>
                                <IconButton onClick={() => setSelectedDate(selectedDate.add(1, 'month'))} size="small">
                                    <ChevronRightIcon fontSize="small" />
                                </IconButton>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', textAlign: 'center' }}>
                                {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                                    <div key={day} style={{ fontWeight: 'bold', padding: '0.25rem', fontSize: '0.75rem' }}>{day}</div>
                                ))}
                                {(() => {
                                    const firstDay = selectedDate.startOf('month');
                                    const lastDay = selectedDate.endOf('month');
                                    const days = [];
                                    
                                    // 填充月初空白日期
                                    for (let i = 0; i < firstDay.day(); i++) {
                                        days.push(<div key={`empty-start-${i}`} />);
                                    }
                                    
                                    // 填充当月日期
                                    for (let i = 1; i <= lastDay.date(); i++) {
                                        const currentDate = selectedDate.set('date', i);
                                        const dateStr = currentDate.format('YYYY-MM-DD');
                                        const color = colorStats[dateStr]; // 使用颜色值而不是ID
                                        
                                        days.push(
                                            <div
                                                key={i}
                                                onClick={() => setSelectedDate(currentDate)}
                                                style={{
                                                    padding: '0.25rem',
                                                    cursor: 'pointer',
                                                    backgroundColor: color ? `${color}44` : undefined,
                                                    borderRadius: '50%',
                                                    width: '1.5em',
                                                    height: '1.5em',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: 'auto',
                                                    fontSize: '0.75rem',
                                                    ...(currentDate.format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD') ? {
                                                        border: '2px solid #1976d2'
                                                    } : {})
                                                }}
                                            >
                                                {i}
                                            </div>
                                        );
                                    }
                                    
                                    return days;
                                })()}
                            </div>
                        </div>
                    </Box>
                    
                    {/* 每日总结区域 - 在同一个 Paper 内 */}
                    <Box sx={{ mt: 1, pt: 2, borderTop: '1px solid #eee' }}>
                        <Typography variant="h6" gutterBottom>
                            每日总结
                        </Typography>
                        
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                今天过得怎么样？
                            </Typography>
                            
                            <Rating
                                name="daily-rating"
                                value={dailyRating}
                                onChange={handleDailyRatingChange}
                                IconContainerComponent={IconContainer}
                                getLabelText={(value) => customIcons[value].label}
                                sx={{
                                    '& .MuiRating-iconFilled': {
                                        fontSize: '1.75rem',
                                    },
                                    '& .MuiRating-iconEmpty': {
                                        fontSize: '1.75rem',
                                        opacity: 0.4
                                    },
                                }}
                            />
                            
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                maxRows={5}
                                placeholder="记录一下今天的感受和总结..."
                                value={dailySummary}
                                onChange={handleDailySummaryChange}
                                variant="outlined"
                                size="small"
                                margin="normal"
                            />
                            
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                {summaryPendingSave ? '正在保存...' : '自动保存'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleOpenNoteDialog}>添加/编辑备注</MenuItem>
            </Menu>

            <Dialog open={noteDialogOpen} onClose={handleCloseNoteDialog}>
                <DialogTitle>时间块备注 ({formatTime(selectedBlock || 0)})</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="备注内容"
                        fullWidth
                        multiline
                        rows={4}
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNoteDialog}>取消</Button>
                    <Button onClick={handleSaveNote} variant="contained">保存</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default TimeBlockView;